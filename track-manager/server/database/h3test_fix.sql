-- -- 修复1: 创建默认分区
-- CREATE TABLE IF NOT EXISTS roads_default PARTITION OF roads DEFAULT;

-- -- 修复2: 创建动态分区管理函数
-- CREATE OR REPLACE FUNCTION create_road_partition(h3code h3index) RETURNS void AS $$
-- DECLARE 
--     partition_name TEXT := 'roads_res10_' || LEFT(h3code::text, 7);
-- BEGIN
--     EXECUTE format(
--         'CREATE TABLE IF NOT EXISTS %I PARTITION OF roads FOR VALUES IN (%L)',
--         partition_name,
--         h3code
--     );
-- END;
-- $$ LANGUAGE plpgsql;

-- -- 修复3: 调整触发器逻辑
-- CREATE OR REPLACE FUNCTION update_road_h3()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF NEW.h3_res10 IS NULL THEN
--         NEW.h3_res10 = h3_lat_lng_to_cell(
--             ST_Y(ST_Centroid(NEW.geometry)), -- 纬度
--             ST_X(ST_Centroid(NEW.geometry)), -- 经度
--             10
--         );
--     END IF;
    
--     IF NEW.h3_res11 IS NULL THEN
--         NEW.h3_res11 = h3_lat_lng_to_cell(
--             ST_Y(ST_Centroid(NEW.geometry)),
--             ST_X(ST_Centroid(NEW.geometry)),
--             11
--         );
--     END IF;
    
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- 修复4: 修复外键约束 (关键修复)
-- ALTER TABLE road_names 
--     ADD COLUMN IF NOT EXISTS h3_res10 h3index;

-- ALTER TABLE road_names 
--     ALTER COLUMN h3_res10 SET NOT NULL;

-- ALTER TABLE road_names 
--     DROP CONSTRAINT IF EXISTS fk_road_id;

-- ALTER TABLE road_names 
--     ADD CONSTRAINT fk_road_id 
--     FOREIGN KEY (road_id, h3_res10) 
--     REFERENCES roads(id, h3_res10)
--     ON DELETE CASCADE;

-- -- 修复5: 重建索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS roads_geometry_gist ON roads USING GIST(geometry);
CREATE INDEX CONCURRENTLY IF NOT EXISTS roads_h3_res10_btree ON roads USING BTREE(h3_res10);
CREATE INDEX CONCURRENTLY IF NOT EXISTS roads_h3_res11_btree ON roads USING BTREE(h3_res11);
