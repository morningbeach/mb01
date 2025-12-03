-- 檢查 AdminSession 表是否存在及其結構
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'AdminSession';

-- 檢查 AdminUser 表中有沒有用戶
SELECT id, email, name, role FROM "AdminUser";

-- 檢查 AdminSession 表中的資料
SELECT * FROM "AdminSession";
