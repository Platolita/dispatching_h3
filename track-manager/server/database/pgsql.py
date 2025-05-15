import osmnx as ox
# 下载北京市的机动车道网络（默认为 MultiDiGraph）
G = ox.graph_from_place("Beijing, China", network_type='drive')
ox.plot_graph(G)
# 将 OSMnx 图转换为 GeoDataFrames
nodes_gdf, edges_gdf = ox.graph_to_gdfs(G, nodes=True, edges=True)

from sqlalchemy import create_engine
engine = create_engine("postgresql+psycopg2://postgres:193878@localhost:5433/RoadsBeijing")
# 将道路边 GeoDataFrame 导入 PostGIS，表名为 beijing_edges
edges_gdf.to_postgis(name='beijing_edges', con=engine, if_exists='replace', index=False)
# 将道路节点 GeoDataFrame 导入 PostGIS，表名为 beijing_nodes
nodes_gdf.to_postgis(name='beijing_nodes', con=engine, if_exists='replace', index=False)
