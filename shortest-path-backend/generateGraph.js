const haversineDistance = (coord1, coord2) => {
    const toRadians = degree => (degree * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers

    const lat1 = toRadians(coord1[0]);
    const lon1 = toRadians(coord1[1]);
    const lat2 = toRadians(coord2[0]);
    const lon2 = toRadians(coord2[1]);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
};

// แยก landmarks เป็นโหนดหลักและ edge
const landmarks = {
    nodes: {
        A: [14.10243706239109, 100.98433],
        B: [14.102170237819724, 100.98376],
        C: [14.103860583932878, 100.98347],
        D: [14.105072043080352, 100.98055],
        E: [14.101031644217857, 100.98352],
        F: [14.10835363603725, 100.98312]
    },
    edges: {
        edge1: [14.10274, 100.98426],
        edge2: [14.10233, 100.98349],
        edge3: [14.10286, 100.98331],
        edge4: [14.10359, 100.98290],
        edge5: [14.10490, 100.98222],
        edge6: [14.10622, 100.98150],
        edge7: [14.10621, 100.98083],
        edge8: [14.10595, 100.98021],
        edge9: [14.10168, 100.98386],
        edge10: [14.10102, 100.98352],
        edge11: [14.10347, 100.98569],
        edge12: [14.10413, 100.98526],
        edge13: [14.10458, 100.98487],
        edge14: [14.10503, 100.98462],
        edge15: [14.10724, 100.98342],
        edge16: [14.10737, 100.98289],
        edge17: [14.10766, 100.98294],
        edge18: [14.10801, 100.98282],
        edge19: [14.10826, 100.98260],
        edge20: [14.10842, 100.98230],
        edge21: [14.10845, 100.98193],
        edge22: [14.10836, 100.98165],
        edge23: [14.10811, 100.98133],
        edge24: [14.10778, 100.98120],
        edge25: [14.10743, 100.98118],
        edge26: [14.10709, 100.98130],
        edge27: [14.10686, 100.98153],
        edge28: [14.10677, 100.98170],
        edge29: [14.10672, 100.98210],
        edge30: [14.10683, 100.98240],
        edge31: [14.10701, 100.98268],
        edge32: [14.10719, 100.98280]
    }
};

// สร้างกราฟเฉพาะโหนดหลัก (ไม่รวม edge)
const graph = {};

const nodeKeys = Object.keys(landmarks.nodes);

nodeKeys.forEach(startNode => {
    graph[startNode] = {};
    nodeKeys.forEach(endNode => {
        if (startNode !== endNode) {
            const distance = haversineDistance(landmarks.nodes[startNode], landmarks.nodes[endNode]);
            graph[startNode][endNode] = parseFloat(distance.toFixed(3)); // Keep up to 3 decimal places
        }
    });
});

console.log(graph); // ใช้ดูกราฟที่ถูกสร้างขึ้น

module.exports = { graph, landmarks };
