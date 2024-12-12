// สร้างแผนที่ด้วย Leaflet.js
const map = L.map('map').setView([14.10243, 100.98433], 16);

// เพิ่ม Tile Layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// กำหนดโหนดและพิกัด (Latitude, Longitude) ที่คุณสามารถกำหนดเอง
const landmarks = {
    A: [14.10243, 100.98433],
    B: [14.102170, 100.98376],
    C: [14.103860, 100.98347],
    D: [14.105072, 100.98055],
    E: [14.10103, 100.98352],
    F: [14.10835, 100.98312],
    // เพิ่มพิกัดที่คุณต้องการใช้
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
        edge32: [14.10719, 100.98280],
        edge33: [14.10138, 100.98411]
};

// ฟังก์ชันเพิ่มหมุด (Markers) ของโหนดทั้งหมด ยกเว้นโหนดที่ต้องการซ่อน
function addMarkers() {
    const hiddenNodes = Array.from({ length: 33 }, (_, i) => `edge${i + 1}`); // ซ่อน edge1 ถึง edge33

    Object.entries(landmarks).forEach(([node, coords]) => {
        if (!hiddenNodes.includes(node)) { // ตรวจสอบว่าโหนดไม่ได้อยู่ในรายชื่อซ่อน
            L.marker(coords)
                .addTo(map)
                .bindPopup(`<b>Node ${node}</b>`); // Popup แสดงชื่อโหนด
        }
    });
}

// เรียกใช้ฟังก์ชันเพิ่มหมุดเมื่อโหลดแผนที่
addMarkers();

// ฟังก์ชันวาดเส้นทางบนแผนที่
function drawPath(coordinates) {
    // ลบเส้นทางเก่าออก (ถ้ามี)
    if (window.currentPath) {
        map.removeLayer(window.currentPath);
    }
    // วาด Polyline บนแผนที่
    window.currentPath = L.polyline(coordinates, { color: 'blue' }).addTo(map);

    // ขยายมุมมองแผนที่ให้ครอบคลุมเส้นทาง
    map.fitBounds(window.currentPath.getBounds());

    // เพิ่มหมุดเริ่มต้นและสิ้นสุด
    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];
}

// ฟังก์ชันจัดการฟอร์มและ Fetch API
document.getElementById('path-form').addEventListener('submit', function (event) {
    event.preventDefault(); // ป้องกันการ reload หน้าเว็บ

    // ดึงข้อมูลจากฟอร์ม
    const start = document.getElementById('start-node').value.trim();
    const end = document.getElementById('end-node').value.trim();

    if (!start || !end) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    // กำหนดพิกัดที่คุณจะใช้ในการคำนวณเส้นทาง
    const pathCoordinates = getCoordinatesForPath(start, end);

    // ส่งข้อมูลไปยัง Backend
    fetch('http://localhost:3000/find-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('result').innerText = `ข้อผิดพลาด: ${data.error}`;
            } else {
                // สร้างข้อความผลลัพธ์
                const pathDescription = `เส้นทาง: ${data.path.join(' -> ')}`;
                const distanceDescription = `ระยะทางทั้งหมด: ${data.distance}`;
                document.getElementById('result').innerHTML = `
                    <p>${pathDescription}</p>
                    <p>${distanceDescription}</p>
                `;

                // ใช้พิกัดจากฟังก์ชัน getCoordinatesForPath
                drawPath(pathCoordinates);
            }
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาด:', error);
            document.getElementById('result').innerText = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        });
});

// ฟังก์ชันกำหนดพิกัดเส้นทางที่ต้องการ
function getCoordinatesForPath(start, end) {
    // พิกัดของแต่ละโหนด
    const coordinates = {
    A: [14.10243, 100.98433],
    B: [14.102170, 100.98376],
    C: [14.103860, 100.98347],
    D: [14.105072, 100.98055],
    E: [14.10103, 100.98352],
    F: [14.10835, 100.98312],
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
        edge32: [14.10719, 100.98280],
        edge33: [14.10138, 100.98411]
    };

    // การกำหนดเส้นทางจากพิกัดของ Start node และ End node
    if (start === "A" && end === "B") {
        // กรณี A ไป B ให้ลากเส้น Polyline ตามพิกัด A -> Custom1 -> Custom2 -> B
        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"], coordinates["B"]];
    }
    
    else if (start === "A" && end === "C") {

        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"],coordinates["edge3"],
         coordinates["edge4"], coordinates["C"]];
    }
    else if (start === "A" && end === "D") {
      
        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"],coordinates["edge3"],
         coordinates["edge4"],coordinates["edge5"],
         coordinates["edge6"],coordinates["edge7"],
         coordinates["edge8"], coordinates["D"]];
    }
    else if (start === "A" && end === "E") {
      
        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"], coordinates["edge9"],
         coordinates["edge33"],coordinates["edge10"],coordinates["E"]];
    }
    else if (start === "A" && end === "F") {
   
        return [coordinates["A"], coordinates["edge1"], 
        coordinates["edge11"], coordinates["edge12"],
        coordinates["edge13"],coordinates["edge14"],
        coordinates["edge15"],coordinates["edge16"],
        coordinates["edge17"],coordinates["edge18"],coordinates["F"]];
    }
    else if (start === "B" && end === "C") {
        
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"], coordinates["C"]];
    }
    else if (start === "B" && end === "D") {
       
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge7"],coordinates["edge8"], coordinates["D"]];
    }
    else if (start === "B" && end === "E") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge9"],coordinates["edge33"],
        coordinates["edge10"],coordinates["E"]];
    }
    else if (start === "B" && end === "F") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge28"],coordinates["edge27"],
        coordinates["edge26"],coordinates["edge25"],
        coordinates["edge24"],coordinates["edge23"],
        coordinates["edge22"],coordinates["edge21"],
        coordinates["edge20"],coordinates["edge19"],
        coordinates["edge18"],coordinates["F"]];
    }
    else if (start === "C" && end === "D") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["C"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge7"],coordinates["edge8"],coordinates["D"]];
    }
    else if (start === "C" && end === "E") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["C"],coordinates["edge4"],
        coordinates["edge3"],coordinates["edge2"],
        coordinates["edge9"],coordinates["edge33"],
        coordinates["edge10"],coordinates["E"]];
    }
    else if (start === "C" && end === "F") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["C"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge28"],coordinates["edge27"],
        coordinates["edge26"],coordinates["edge25"],
        coordinates["edge24"],coordinates["edge23"],
        coordinates["edge22"],coordinates["edge21"],
        coordinates["edge20"],coordinates["edge19"],
        coordinates["edge18"], coordinates["F"]];
    }
    else if (start === "D" && end === "E") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["D"],coordinates["edge8"],
        coordinates["edge7"],coordinates["edge6"],
        coordinates["edge5"],coordinates["edge4"],
        coordinates["edge3"],coordinates["edge9"],
        coordinates["edge33"], coordinates["E"]];
    }
    else if (start === "D" && end === "F") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["D"], coordinates["edge8"],
        coordinates["edge7"], coordinates["edge6"],
        coordinates["edge28"], coordinates["edge27"],
        coordinates["edge26"], coordinates["edge25"],
        coordinates["edge24"], coordinates["edge23"],
        coordinates["edge22"], coordinates["edge21"],
        coordinates["edge20"], coordinates["edge19"],
        coordinates["edge18"], coordinates["F"]];
    }
    else if (start === "E" && end === "F") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["E"],
        coordinates["edge10"],coordinates["edge33"],
        coordinates["edge9"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge28"],coordinates["edge27"],
        coordinates["edge26"],coordinates["edge25"],
        coordinates["edge24"], coordinates["edge23"],
        coordinates["edge22"], coordinates["edge21"],
        coordinates["edge20"], coordinates["edge19"],
        coordinates["edge18"],coordinates["F"]];
    }
    else if (start === "B" && end === "A") {

        return [coordinates["B"],coordinates["edge2"],
         coordinates["edge1"],coordinates["A"]];
    }
    else if (start === "C" && end === "A") {

        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"],coordinates["edge3"],
         coordinates["edge4"], coordinates["C"]];
    }
    else if (start === "D" && end === "A") {
      
        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"],coordinates["edge3"],
         coordinates["edge4"],coordinates["edge5"],
         coordinates["edge6"],coordinates["edge7"],
         coordinates["edge8"], coordinates["D"]];
    }
    else if (start === "E" && end === "A") {
      
        return [coordinates["A"], coordinates["edge1"],
         coordinates["edge2"], coordinates["edge9"],
         coordinates["edge33"],coordinates["edge10"],coordinates["E"]];
    }
    else if (start === "F" && end === "A") {
   
        return [coordinates["A"], coordinates["edge1"], 
        coordinates["edge11"], coordinates["edge12"],
        coordinates["edge13"],coordinates["edge14"],
        coordinates["edge15"],coordinates["edge16"],
        coordinates["edge17"],coordinates["edge18"],coordinates["F"]];
    }
    else if (start === "C" && end === "B") {
        
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"], coordinates["C"]];
    }
    else if (start === "D" && end === "B") {
       
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge7"],coordinates["edge8"], coordinates["D"]];
    }
    else if (start === "E" && end === "B") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge9"],coordinates["edge33"],
        coordinates["edge10"],coordinates["E"]];
    }
    else if (start === "F" && end === "B") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["B"],coordinates["edge2"],
        coordinates["edge3"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge28"],coordinates["edge27"],
        coordinates["edge26"],coordinates["edge25"],
        coordinates["edge24"],coordinates["edge23"],
        coordinates["edge22"],coordinates["edge21"],
        coordinates["edge20"],coordinates["edge19"],
        coordinates["edge18"],coordinates["F"]];
    }
    else if (start === "D" && end === "C") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["C"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge7"],coordinates["edge8"],coordinates["D"]];
    }
    else if (start === "E" && end === "C") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["C"],coordinates["edge4"],
        coordinates["edge3"],coordinates["edge2"],
        coordinates["edge9"],coordinates["edge33"],
        coordinates["edge10"],coordinates["E"]];
    }
    else if (start === "F" && end === "C") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["C"],coordinates["edge4"],
        coordinates["edge5"],coordinates["edge6"],
        coordinates["edge28"],coordinates["edge27"],
        coordinates["edge26"],coordinates["edge25"],
        coordinates["edge24"],coordinates["edge23"],
        coordinates["edge22"],coordinates["edge21"],
        coordinates["edge20"],coordinates["edge19"],
        coordinates["edge18"], coordinates["F"]];
    }
    else if (start === "E" && end === "D") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["D"],coordinates["edge8"],
        coordinates["edge7"],coordinates["edge6"],
        coordinates["edge5"],coordinates["edge4"],
        coordinates["edge3"],coordinates["edge9"],
        coordinates["edge33"], coordinates["E"]];
    }
    else if (start === "F" && end === "D") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["D"], coordinates["edge8"],
        coordinates["edge7"], coordinates["edge6"],
        coordinates["edge28"], coordinates["edge27"],
        coordinates["edge26"], coordinates["edge25"],
        coordinates["edge24"], coordinates["edge23"],
        coordinates["edge22"], coordinates["edge21"],
        coordinates["edge20"], coordinates["edge19"],
        coordinates["edge18"], coordinates["F"]];
    }
    else if (start === "F" && end === "E") {
        // กรณี E ไป F ให้ลากเส้น Polyline ตามพิกัด E -> F
        return [coordinates["F"],coordinates["edge18"],
        coordinates["edge17"],coordinates["edge16"],
        coordinates["edge15"],coordinates["edge14"],
        coordinates["edge13"],coordinates["edge12"],
        coordinates["edge11"],coordinates["edge1"],
        coordinates["edge2"],coordinates["edge9"],
        coordinates["edge33"],coordinates["edge10"],coordinates["E"]];
    }
    // สำหรับกรณีอื่นๆ สามารถทำได้เพิ่มเติม
    else {
        return [coordinates[start], coordinates[end]];
    }
}
