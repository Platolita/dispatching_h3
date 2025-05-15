-- 1. 删除所有分区表
DO $$
DECLARE
    part_name text;
BEGIN
    FOR part_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE 'roads_res10_%'
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || part_name || ' CASCADE';
    END LOOP;
END $$;

-- 2. 清空主表及关联表
TRUNCATE TABLE roads CASCADE;
TRUNCATE TABLE road_names CASCADE;
TRUNCATE TABLE highway_types CASCADE;

-- 3. 重置序列
ALTER SEQUENCE roads_id_seq RESTART WITH 1;
ALTER SEQUENCE highway_types_id_seq RESTART WITH 1;

-- 4. 重建默认分区
DROP TABLE IF EXISTS roads_default;
CREATE TABLE roads_default PARTITION OF roads DEFAULT;

-- 5. 重建索引（可选）
REINDEX TABLE roads;
REINDEX TABLE road_names;