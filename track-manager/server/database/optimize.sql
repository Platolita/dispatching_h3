-- 添加外键约束
ALTER TABLE road_names 
ADD CONSTRAINT fk_road_id 
FOREIGN KEY (road_id) REFERENCES roads(id)
ON DELETE CASCADE;

-- 创建空间索引
CREATE INDEX roads_geometry_idx 
ON roads USING GIST (geometry);

-- 验证执行结果
VACUUM ANALYZE roads;