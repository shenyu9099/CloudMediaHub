// Global state
let currentUser = null;
let allContents = [];
let currentFilter = 'all';

// Initialize after page load
document.addEventListener('DOMContentLoaded', function() {
    // Check local storage for user info
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }

    // Load initial data
    loadTags();
    loadContents();

    // Setup drag and drop
    setupDragAndDrop();
});

// ==================== User Authentication ====================

// Show login modal
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

// Show register modal
function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// User registration
async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch(API_CONFIG.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Registration successful! Please login', 'success');
            closeModal('registerModal');
            showLogin();
        } else {
            showToast(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed, please try again', 'error');
    }
}

// User login
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(API_CONFIG.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserUI();
            closeModal('loginModal');
            showToast('Login successful!', 'success');
            loadContents();
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed, please try again', 'error');
    }
}

// User logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    showToast('Logged out successfully', 'success');
    loadContents();
}

// Update user interface
function updateUserUI() {
    const userSection = document.getElementById('userSection');
    const authSection = document.getElementById('authSection');
    
    if (currentUser) {
        document.getElementById('username').textContent = currentUser.username || currentUser.name;
        userSection.style.display = 'flex';
        authSection.style.display = 'none';
    } else {
        userSection.style.display = 'none';
        authSection.style.display = 'flex';
    }
}

// ==================== Content Loading ====================

// Load tags
async function loadTags() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return; // Skip if element doesn't exist on this page
    
    try {
        const response = await fetch(API_CONFIG.GET_TAGS);
        const data = await response.json();

        if (data.success && data.tags) {
            tagsList.innerHTML = data.tags.map(tag => 
                `<span class="tag" onclick="filterByTag('${tag.TagName}')">${tag.TagName}</span>`
            ).join('');
        }
    } catch (error) {
        console.error('Load tags error:', error);
    }
}

// Load contents
async function loadContents(filter = 'all') {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const contentGrid = document.getElementById('contentGrid');
    
    // Skip if required elements don't exist on this page
    if (!contentGrid) return;
    
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    
    try {
        let url = API_CONFIG.GET_CONTENTS;
        if (filter !== 'all') {
            url += `?fileType=${filter}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.contents) {
            allContents = data.contents;
            displayContents(allContents);
        } else {
            contentGrid.innerHTML = 
                '<p style="color: #666; grid-column: 1/-1; text-align: center;">No content available</p>';
        }
    } catch (error) {
        console.error('Load content error:', error);
        showToast('Failed to load content', 'error');
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// Display contents
function displayContents(contents) {
    const contentGrid = document.getElementById('contentGrid');
    if (!contentGrid) return; // Skip if element doesn't exist
    
    if (contents.length === 0) {
        contentGrid.innerHTML = '<p style="color: #666; grid-column: 1/-1; text-align: center;">No content available</p>';
        return;
    }

    contentGrid.innerHTML = contents.map(content => {
        const imageUrl = getMediaUrl(content);
        const typeIcon = getTypeIcon(content.FileType);
        
        return `
            <div class="content-card" onclick="showDetail('${content.ContentId}')">
                <img class="card-image" src="${imageUrl}" alt="${content.Title}" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect fill=\\'%23667eea\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'60\\' fill=\\'white\\'%3E${typeIcon}%3C/text%3E%3C/svg%3E'">
                <div class="card-body">
                    <h3 class="card-title">${content.Title}</h3>
                    <div class="card-meta">
                        <span>${typeIcon} ${getFileTypeText(content.FileType)}</span>
                        <div class="card-stats">
                            <span class="card-stat">❤️ ${content.LikeCount || 0}</span>
                            <span class="card-stat">👁️ ${content.ViewCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get media URL - accepts either content object or URL string
function getMediaUrl(contentOrUrl) {
    // If it's a string (direct URL)
    if (typeof contentOrUrl === 'string') {
        if (contentOrUrl.startsWith('http')) {
            return contentOrUrl;
        }
        return `${STORAGE_CONFIG.BASE_URL}${contentOrUrl}`;
    }
    
    // If it's an object with BlobUrl property
    if (contentOrUrl && contentOrUrl.BlobUrl) {
        if (contentOrUrl.BlobUrl.startsWith('http')) {
            return contentOrUrl.BlobUrl;
        }
        return `${STORAGE_CONFIG.BASE_URL}${contentOrUrl.BlobUrl}`;
    }
    
    return '';
}

// Get file type icon
function getTypeIcon(type) {
    const icons = {
        'image': '🖼️',
        'video': '🎬',
        'audio': '🎵'
    };
    return icons[type] || '📄';
}

// Get file type text
function getFileTypeText(type) {
    const texts = {
        'image': 'Image',
        'video': 'Video',
        'audio': 'Audio'
    };
    return texts[type] || 'File';
}

// ==================== Content Filtering ====================

// Filter by type
function filterByType(type) {
    currentFilter = type;
    
    // Update button status
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) event.target.classList.add('active');
    
    // Update title
    const titles = {
        'all': 'All Content',
        'image': 'Images',
        'video': 'Videos',
        'audio': 'Audio'
    };
    const contentTitle = document.getElementById('contentTitle');
    if (contentTitle) contentTitle.textContent = titles[type];
    
    // 客户端筛选
    if (type === 'all') {
        displayContents(allContents);
    } else {
        const filtered = allContents.filter(content => content.FileType === type);
        displayContents(filtered);
    }
}

// Filter by tag
async function filterByTag(tagName) {
    try {
        const response = await fetch(`${API_CONFIG.GET_CONTENTS}&tag=${encodeURIComponent(tagName)}`);
        const data = await response.json();
        
        if (data.success) {
            allContents = data.contents || [];
            const contentTitle = document.getElementById('contentTitle');
            if (contentTitle) contentTitle.textContent = `Tag: ${tagName}`;
            displayContents(allContents);
        } else {
            showToast('Failed to load tag content', 'error');
        }
    } catch (error) {
        console.error('Tag filter error:', error);
        showToast('Failed to load tag content', 'error');
    }
}

// Search content
function searchContent() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayContents(allContents);
        return;
    }
    
    const filtered = allContents.filter(content => 
        content.Title.toLowerCase().includes(searchTerm) ||
        (content.Description && content.Description.toLowerCase().includes(searchTerm))
    );
    
    const contentTitle = document.getElementById('contentTitle');
    if (contentTitle) contentTitle.textContent = `Search: ${searchTerm}`;
    displayContents(filtered);
}

// Sort
function sortBy(type) {
    let sorted = [...allContents];
    
    if (type === 'time') {
        sorted.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
    } else if (type === 'like') {
        sorted.sort((a, b) => (b.LikeCount || 0) - (a.LikeCount || 0));
    }
    
    displayContents(sorted);
}

// ==================== 内容上传 ====================

// Show upload modal
function showUpload() {
    if (!currentUser) {
        showToast('Please login first', 'error');
        showLogin();
        return;
    }
    document.getElementById('uploadModal').style.display = 'block';
}

// Setup drag and drop upload
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    if (!uploadArea) return; // Skip if element doesn't exist
    
    // Note: click event is now handled by uploadPrompt onclick
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = 'rgba(102, 126, 234, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('fileInput').files = files;
            handleFileSelect({ target: { files: files } });
        }
    });
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileName = document.getElementById('fileName');
    const filePreview = document.getElementById('filePreview');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const previewImage = document.getElementById('previewImage');
    const previewVideo = document.getElementById('previewVideo');
    const previewAudio = document.getElementById('previewAudio');
    
    fileName.textContent = file.name;
    filePreview.style.display = 'block';
    uploadPrompt.style.display = 'none';
    
    // Hide all previews first
    previewImage.style.display = 'none';
    if (previewVideo) previewVideo.style.display = 'none';
    if (previewAudio) previewAudio.style.display = 'none';
    
    // Show appropriate preview based on file type
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/') && previewVideo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewVideo.src = e.target.result;
            previewVideo.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/') && previewAudio) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewAudio.src = e.target.result;
            previewAudio.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Upload media
async function uploadMedia(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Please select a file', 'error');
        return;
    }
    
    const title = document.getElementById('uploadTitle').value;
    const description = document.getElementById('uploadDesc').value;
    const tagsInput = document.getElementById('uploadTags').value;
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];
    
    // 确定文件类型
    let fileType = 'image';
    if (file.type.startsWith('video/')) {
        fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
        fileType = 'audio';
    }
    
    // 显示上传进度
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = '上传中...';
    progressBar.style.display = 'block';
    
    try {
        // 将文件转换为Base64
        const fileContent = await fileToBase64(file);
        
        // 模拟上传进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = progress + '%';
            }
        }, 200);
        
        const response = await fetch(API_CONFIG.UPLOAD_MEDIA, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                title: title,
                description: description,
                fileName: file.name,
                fileContent: fileContent.split(',')[1], // 移除 data:image/...;base64, 前缀
                fileType: fileType,
                contentType: file.type,
                tags: tags
            })
        });
        
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Upload successful!', 'success');
            
            // Close modal if exists
            if (document.getElementById('uploadModal')) {
                closeModal('uploadModal');
            }
            
            // Reset form
            document.getElementById('uploadTitle').value = '';
            document.getElementById('uploadDesc').value = '';
            document.getElementById('uploadTags').value = '';
            fileInput.value = '';
            document.getElementById('filePreview').style.display = 'none';
            const uploadPrompt = document.getElementById('uploadPrompt');
            if (uploadPrompt) uploadPrompt.style.display = 'block';
            
            // Redirect to discover page
            setTimeout(() => {
                window.location.href = 'discover.html';
            }, 1000);
        } else {
            showToast(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed, please try again', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传';
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    }
}

// 文件转Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ==================== 内容详情 ====================

// Display content detail - redirect to detail page
async function showDetail(contentId) {
    window.location.href = `detail.html?id=${contentId}`;
}

// Legacy modal-based detail view (kept for compatibility)
async function showDetailModal(contentId) {
    try {
        const response = await fetch(`${API_CONFIG.GET_CONTENT_BY_ID}&id=${contentId}`);
        const data = await response.json();
        
        if (data.success && data.content) {
            const content = data.content;
            const mediaUrl = getMediaUrl(content);
            
            // 记录浏览
            if (currentUser) {
                recordInteraction(contentId, 'view');
            }
            
            let mediaHtml = '';
            if (content.FileType === 'image') {
                mediaHtml = `<img src="${mediaUrl}" style="max-width: 100%; border-radius: 8px;" />`;
            } else if (content.FileType === 'video') {
                mediaHtml = `<video controls style="max-width: 100%; border-radius: 8px;">
                    <source src="${mediaUrl}" type="video/mp4">
                </video>`;
            } else if (content.FileType === 'audio') {
                mediaHtml = `<audio controls style="width: 100%;">
                    <source src="${mediaUrl}" type="audio/mpeg">
                </audio>`;
            }
            
            // 获取用户名
            const username = content.Username || '匿名用户';
            
            // 检查是否是内容所有者
            const isOwner = currentUser && currentUser.id === content.UserId;
            
            // 所有者操作按钮
            const ownerButtons = isOwner ? `
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="editContent('${content.ContentId}')" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">✏️ 编辑</button>
                    <button onclick="deleteContentConfirm('${content.ContentId}')" style="background: #f56565; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">🗑️ 删除</button>
                </div>
            ` : '';
            
            document.getElementById('detailContent').innerHTML = `
                <h2>${content.Title}</h2>
                <p style="color: #667eea; margin: 0.5rem 0; font-size: 0.9rem;">👤 ${username}</p>
                <small style="color: #999;">上传于 ${new Date(content.CreatedAt).toLocaleString('zh-CN')}</small>
                <div style="margin: 1.5rem 0;">
                    ${mediaHtml}
                </div>
                <p style="color: #666; margin: 1rem 0;">${content.Description || '暂无描述'}</p>
                <div style="display: flex; gap: 1rem; margin: 1.5rem 0; align-items: center; flex-wrap: wrap;">
                    <button onclick="likeContent('${content.ContentId}')">❤️ 点赞 (${content.LikeCount || 0})</button>
                    <span style="color: #667eea; font-weight: 500;">💬 评论 (${content.CommentCount || 0})</span>
                    <button onclick="shareContent('${content.ContentId}')">🔗 分享 (${content.ShareCount || 0})</button>
                    <span style="color: #666;">👁️ ${content.ViewCount || 0} 次浏览</span>
                </div>
                ${ownerButtons}
                <div id="commentsSection" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
                    <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">💬 评论区</h3>
                    <div id="commentBox" style="margin-bottom: 1.5rem; padding: 1rem; background: #f7fafc; border-radius: 8px;">
                        <textarea id="commentInput" placeholder="写下你的评论..." style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; min-height: 80px; font-size: 14px;"></textarea>
                        <button onclick="submitComment('${content.ContentId}')" style="margin-top: 0.5rem; background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">发送评论</button>
                    </div>
                    <div id="commentsList" style="max-height: 400px; overflow-y: auto;">
                        <div style="text-align: center; color: #999; padding: 1rem;">加载评论中...</div>
                    </div>
                </div>
            `;
            
            // Load comments list
            loadComments(content.ContentId);
            
            document.getElementById('detailModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Load detail error:', error);
        showToast('Failed to load', 'error');
    }
}

// ==================== 互动功能 ====================

// Like content
async function likeContent(contentId) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        showLogin();
        return;
    }
    
    await recordInteraction(contentId, 'like');
    showToast('Liked!', 'success');
    
    // 重新加载详情
    setTimeout(() => showDetail(contentId), 500);
}

// Share content
async function shareContent(contentId) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        showLogin();
        return;
    }
    
    await recordInteraction(contentId, 'share');
    showToast('Shared!', 'success');
    
    // 这里可以添加实际的分享逻辑
}

// Record interaction
async function recordInteraction(contentId, action, comment = null) {
    if (!currentUser) return;
    
    try {
        const payload = {
            userId: currentUser.id,
            contentId: contentId,
            action: action
        };
        
        if (comment) {
            payload.comment = comment;
        }
        
        await fetch(API_CONFIG.INTERACTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Record interaction error:', error);
    }
}

// Toggle comments section
function toggleComments(contentId) {
    const commentsSection = document.getElementById('commentsSection');
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        loadComments(contentId);
    } else {
        commentsSection.style.display = 'none';
    }
}

// Load comments list
async function loadComments(contentId) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '<div style="text-align: center; color: #999; padding: 1rem;">加载评论中...</div>';
    
    try {
        const response = await fetch(`${API_CONFIG.GET_COMMENTS}&contentId=${contentId}`);
        const data = await response.json();
        
        if (data.success && data.comments && data.comments.length > 0) {
            // 创建用户映射
            const userMap = {};
            if (data.users) {
                data.users.forEach(user => {
                    userMap[user.UserId] = user.Username;
                });
            }
            
            // 按时间倒序排序（最新的在前）
            const sortedComments = data.comments.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            // 显示评论列表
            commentsList.innerHTML = sortedComments.map(comment => {
                const username = userMap[comment.userId] || '匿名用户';
                const time = new Date(comment.timestamp).toLocaleString('zh-CN');
                
                return `
                    <div style="padding: 1rem; background: #f7fafc; border-radius: 8px; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: #667eea; font-weight: 500;">👤 ${username}</span>
                            <small style="color: #999;">${time}</small>
                        </div>
                        <p style="color: #333; margin: 0; line-height: 1.5;">${comment.comment || ''}</p>
                    </div>
                `;
            }).join('');
        } else {
            commentsList.innerHTML = '<div style="text-align: center; color: #999; padding: 1rem;">No comments yet. Be the first to comment!</div>';
        }
    } catch (error) {
        console.error('Load comments error:', error);
        commentsList.innerHTML = '<div style="text-align: center; color: #f56565; padding: 1rem;">加载评论失败</div>';
    }
}

// Submit comment
async function submitComment(contentId) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        showLogin();
        return;
    }
    
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    
    if (!comment) {
        showToast('Please enter comment', 'error');
        return;
    }
    
    try {
        await fetch(API_CONFIG.INTERACTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                contentId: contentId,
                action: 'comment',
                comment: comment
            })
        });
        
        showToast('Comment posted!', 'success');
        commentInput.value = '';
        
        // 重新加载评论列表
        setTimeout(() => loadComments(contentId), 500);
    } catch (error) {
        console.error('Comment error:', error);
        showToast('Comment failed', 'error');
    }
}

// Edit content
function editContent(contentId, title, description, tags) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    // Get or create edit modal
    let editModal = document.getElementById('editModal');
    
    if (!editModal) {
        // Create edit modal if it doesn't exist
        editModal = document.createElement('div');
        editModal.id = 'editModal';
        editModal.className = 'modal';
        editModal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('editModal')">&times;</span>
                <h2>Edit Content</h2>
                <form onsubmit="submitEdit(event)">
                    <input type="hidden" id="editContentId" />
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="editTitle" required placeholder="Enter title" />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editDesc" rows="5" placeholder="Enter description (optional)"></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-block">Save Changes</button>
                </form>
            </div>
        `;
        document.body.appendChild(editModal);
    }
    
    // Fill in current values
    document.getElementById('editContentId').value = contentId;
    document.getElementById('editTitle').value = title || '';
    document.getElementById('editDesc').value = description || '';
    
    // Show the modal
    editModal.style.display = 'block';
}

// Submit edit form
function submitEdit(event) {
    event.preventDefault();
    
    const contentId = document.getElementById('editContentId').value;
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDesc').value;
    
    updateContent(contentId, title, description);
}

// Update content
async function updateContent(contentId, title, description) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_CONFIG.UPDATE_CONTENT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: contentId,
                userId: currentUser.id,
                title: title,
                description: description
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal('editModal');
            showToast('Updated successfully!', 'success');
            
            // Reload the page to show updated content
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            showToast(data.error || 'Update failed', 'error');
        }
    } catch (error) {
        console.error('Update error:', error);
        showToast('Update failed', 'error');
    }
}

// Delete content confirmation
function deleteContentConfirm(contentId) {
    if (confirm('Are you sure you want to delete this content? This action cannot be undone!')) {
        deleteContentById(contentId);
    }
}

// Delete content
async function deleteContentById(contentId) {
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.DELETE_CONTENT}&id=${contentId}&userId=${currentUser.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Deleted successfully!', 'success');
             
            // Redirect to discover page after deletion
            setTimeout(() => {
                window.location.href = 'discover.html';
            }, 500);
        } else {
            showToast(data.error || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Delete failed', 'error');
    }
}

// ==================== 工具函数 ====================

// Show toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Show my likes
async function showMyLikes() {
    if (!currentUser) {
        showToast('Please login first', 'error');
        showLogin();
        return;
    }
    
    document.getElementById('myLikesModal').style.display = 'block';
    document.getElementById('myLikesLoading').style.display = 'block';
    document.getElementById('myLikesContent').innerHTML = '';
    
    try {
        const response = await fetch(`${API_CONFIG.GET_MY_LIKES}&userId=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success && data.contents && data.contents.length > 0) {
            // 使用现有的 displayContents 函数的逻辑
            const myLikesContent = document.getElementById('myLikesContent');
            myLikesContent.innerHTML = data.contents.map(content => {
                const imageUrl = getMediaUrl(content);
                const typeIcon = getTypeIcon(content.FileType);
                const username = content.Username || '匿名用户';
                
                return `
                    <div class="content-card" onclick="showDetail('${content.ContentId}')">
                        <img class="card-image" src="${imageUrl}" alt="${content.Title}" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect fill=\\'%23667eea\\' width=\\'200\\' height=\\'200\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'60\\' fill=\\'white\\'%3E${typeIcon}%3C/text%3E%3C/svg%3E'">
                        <div class="card-body">
                            <h3 class="card-title">${content.Title}</h3>
                            <p class="card-author">👤 ${username}</p>
                            <div class="card-meta">
                                <span>${typeIcon} ${getFileTypeText(content.FileType)}</span>
                                <div class="card-stats">
                                    <span class="card-stat">❤️ ${content.LikeCount || 0}</span>
                                    <span class="card-stat">👁️ ${content.ViewCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            document.getElementById('myLikesContent').innerHTML = 
                '<p style="color: #666; text-align: center; padding: 2rem; grid-column: 1/-1;">你还没有点赞任何内容</p>';
        }
    } catch (error) {
        console.error('Load likes error:', error);
        showToast('Failed to load', 'error');
        document.getElementById('myLikesContent').innerHTML = 
            '<p style="color: #f56565; text-align: center; padding: 2rem; grid-column: 1/-1;">加载失败，请重试</p>';
    } finally {
        document.getElementById('myLikesLoading').style.display = 'none';
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

