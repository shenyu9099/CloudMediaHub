// API 配置 - CloudMediaHub 所有接口地址
const API_CONFIG = {
    // ===== 用户认证模块 =====
    REGISTER: 'https://prod-61.japaneast.logic.azure.com:443/workflows/f442d5ea80ea44fb94ec2859433a5309/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=XCgCppFjoJ_LWmq18TwtWLWZ8j3wxy7eATAfGCbYjJM',
    LOGIN: 'https://prod-56.japaneast.logic.azure.com:443/workflows/108760c76dd44e54bb139c37d1320cd8/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=icH2K_S50eLkaBTzJK5wPmKiXDirHsMnO_S82ZDwld8',
    
    // ===== 媒体上传模块 =====
    UPLOAD_MEDIA: 'https://prod-59.japaneast.logic.azure.com:443/workflows/53ca88fa9fc8483fbb31beca0b01aca8/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=kr77621bjh9_LjS1P_kMTpX7k4VIWlya35_DDy0Y_TY',
    
    // ===== 内容管理模块 =====
    GET_CONTENTS: 'https://prod-52.japaneast.logic.azure.com:443/workflows/f5a86d41df7f49c9a341fc17f5805703/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=QgnA4agEgb1B7Mb0g1C4ANxDEzxIRWrnrT-YjbX4XTI',
    GET_CONTENT_BY_ID: 'https://prod-28.japaneast.logic.azure.com:443/workflows/8d8353e172bb4be18ac1c23331edd580/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=O6J0n86mj7FbN2hBkCX-pK5BMqUe3TrITamzUywhY1k',
    UPDATE_CONTENT: 'https://prod-02.japaneast.logic.azure.com:443/workflows/00ac4d1ed3b0468ca64d869142d7d48e/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=k2TWxnWYVNYH9slXPoExyaQlbdVglcCcESVN78rTDYg',
    DELETE_CONTENT: 'https://prod-19.japaneast.logic.azure.com:443/workflows/cd69af564b0a42b1b840c9c03c0b3b92/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=NS4DfLa2BHRBAsALZcLD_z4CFKSKN-EWaz9vT7bY8as',
    
    // ===== 标签模块 =====
    GET_TAGS: 'https://prod-41.japaneast.logic.azure.com:443/workflows/303e61385b6d48c88a05cdc5880f5ce0/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=HbpTShHY7dwi3H3P59v6qrm0lz2farQYahNNSg_w2Mc',
    
    // ===== 互动模块 =====
    INTERACTION: 'https://prod-14.japaneast.logic.azure.com:443/workflows/36895db2e8ad4b1e8e39c2de510dd6dd/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=wlawC9PlWx_cM9IrWx4D6cCTy4gDFKkBgvWhtLWvTcI',
    
    // ===== 我的点赞模块 =====
    GET_MY_LIKES: 'https://prod-59.japaneast.logic.azure.com:443/workflows/6660da6253db4007b09c578c1f0f0b2d/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=yk_N1Z0dM_6XjVnURgBACc3V5v6LXGvQwGGNjZF1nAQ',
    
    // ===== 评论模块 =====
    GET_COMMENTS: 'https://prod-30.japaneast.logic.azure.com:443/workflows/474fb0b0350a468f9f19abd2f43ead88/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=uppxvRIwhpe7e0kZ9L6rrLs9b5OUyo-ayXMe0Tpyj9Q'
};

// 示例 URL 格式：
// REGISTER: 'https://prod-xx.francecentral.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=...',

// 存储账户配置（用于显示图片）
const STORAGE_CONFIG = {
    ACCOUNT_NAME: 'cloudmediahubstorage',
    BASE_URL: 'https://cloudmediahubstorage.blob.core.windows.net'
};

// ===== API 部署状态 =====
// ✅ REGISTER: 用户注册 - 已部署
// ✅ LOGIN: 用户登录 - 已部署
// ✅ UPLOAD_MEDIA: 媒体上传 - 已部署
// ✅ GET_CONTENTS: 获取内容列表 - 已部署
// ✅ GET_CONTENT_BY_ID: 获取内容详情 - 已部署
// ✅ UPDATE_CONTENT: 更新内容 - 已部署
// ✅ DELETE_CONTENT: 删除内容 - 已部署
// ✅ GET_TAGS: 获取标签 - 已部署（测试通过）
// ✅ INTERACTION: 用户互动 - 已部署
// 
// 🎉 所有 API 接口已完成部署！

