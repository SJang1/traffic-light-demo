-- schema.sql
DROP TABLE IF EXISTS traffic_lights;

CREATE TABLE traffic_lights (
    id INTEGER PRIMARY KEY,
    distance_cm INTEGER NOT NULL DEFAULT 0 CHECK(distance_cm >= 0),
    status TEXT NOT NULL DEFAULT 'red' CHECK(status IN ('red', 'yellow', 'green')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data with a sample distance (e.g., 150 cm)
INSERT INTO traffic_lights (id, distance_cm, status, last_updated) 
VALUES (
    1, 
    150,  -- Initial distance of 150 cm
    'red',
    CURRENT_TIMESTAMP
);