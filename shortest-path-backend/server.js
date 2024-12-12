const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// ตัวอย่างกราฟ (โหนดและน้ำหนัก)
const graph = {
    A: { B: 0.146, C: 0.362, D: 0.864, E: 0.320, F: 0.892},
    B: { A: 0.146, C: 0.765, D: 0.264, E: 0.240, F: 0.900},
    C: { A: 0.362, B: 0.765, D: 0.362, E: 0.421, F: 0.831},
    D: { A: 0.864, B: 0.264, C: 0.362, E: 0.639, F: 0.705},
    E: { A: 0.320, B: 0.240, C: 0.421, D: 0.639, F: 0.705},
    F: { A: 0.892, B: 0.900, C: 0.831, D: 0.705, E: 1},
};

// พิกัดของแต่ละโหนด
const landmarks = {
    A: [14.10243706239109, 100.98433],
        B: [14.102170237819724, 100.98376],
        C: [14.103860583932878, 100.98347],
        D: [14.105072043080352, 100.98055],
        E: [14.101031644217857, 100.98352],
        F: [14.10835363603725, 100.98312]
};

// ฟังก์ชัน Dijkstra คำนวณเส้นทางที่สั้นที่สุด
function dijkstra(graph, start, end) {
    const distances = {};
    const visited = {};
    const previous = {};
    const queue = [];

    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        visited[node] = false;
        previous[node] = null;
    });

    distances[start] = 0;
    queue.push({ node: start, distance: 0 });

    while (queue.length > 0) {
        queue.sort((a, b) => a.distance - b.distance);
        const { node } = queue.shift();

        if (node === end) break;

        visited[node] = true;

        for (const neighbor in graph[node]) {
            if (!visited[neighbor]) {
                const newDistance = distances[node] + graph[node][neighbor];
                if (newDistance < distances[neighbor]) {
                    distances[neighbor] = newDistance;
                    previous[neighbor] = node;
                    queue.push({ node: neighbor, distance: newDistance });
                }
            }
        }
    }

    const path = [];
    let current = end;
    while (current) {
        path.unshift(current);
        current = previous[current];
    }

    return { path, distance: distances[end] };
}

// เส้นทาง API
app.post('/find-path', (req, res) => {
    const { start, end } = req.body;

    // ตรวจสอบว่าโหนดที่ส่งมามีอยู่หรือไม่
    if (!graph[start] || !graph[end]) {
        return res.status(400).json({ error: 'Invalid start or end node.' });
    }

    const { path, distance } = dijkstra(graph, start, end);

    // พิกัดของแต่ละโหนดในเส้นทาง
    const coordinates = path.map(node => landmarks[node]);

    // แปลงระยะทางเป็นเมตรหรือกิโลเมตร
    const distanceInMeters = distance * 1000; // สมมติว่าน้ำหนักในกราฟคือกิโลเมตร
    const formattedDistance = distanceInMeters >= 1000
        ? `${(distanceInMeters / 1000).toFixed(2)} km`
        : `${Math.round(distanceInMeters)} m`;

    res.json({
        path, // เส้นทางโหนดที่ต้องผ่าน
        distance: formattedDistance, // ระยะทางในหน่วย SI
        coordinates, // พิกัดตำแหน่ง
    });
});

// เริ่มต้นเซิร์ฟเวอร์
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
