-- schema.sql
DROP TABLE IF EXISTS traffic_lights;
CREATE TABLE traffic_lights (
    id INTEGER PRIMARY KEY,
    location INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('red', 'yellow', 'green')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO traffic_lights (id, location, status) 
VALUES (1, 20, 'red');