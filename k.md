k6_http_reqs_total
```

3. **Click en "Run queries"** (botón azul arriba a la derecha)

4. **En "Title"** (Panel options, a la derecha): Cambia "New panel" por:
```
   K6 - Total HTTP Requests
```

5. **Click en "Save dashboard"** (arriba a la derecha)

---

### Panel 2: Duración Promedio de Requests

1. Click en **"Add"** → **"Visualization"** (arriba)

2. **Data source**: `grafanacloud-marianahernandez1510202-prom`

3. **Metric**: 
```
   k6_http_req_duration_avg
```

4. **Visualization** (derecha): Cambia de "Time series" a **"Gauge"**

5. **Title**: 
```
   K6 - Average Response Time
```

6. **Save**

---

### Panel 3: Tasa de Éxito de K6

1. **Add** → **Visualization**

2. **Metric**:
```
   k6_load_test_success
```

3. **Visualization**: **"Stat"**

4. **Title**:
```
   K6 Load Test Success
```

5. En **Standard options** → **Mappings** (abajo a la derecha):
   - Click **"+ Add value mapping"**
   - Type: "Value"
   - Value: `0` → Display text: `FAILED` → Color: Red
   - Click **"+ Add value mapping"**
   - Value: `1` → Display text: `SUCCESS` → Color: Green

6. **Save**

---

### Panel 4: Virtual Users (VUs)

1. **Add** → **Visualization**

2. **Metric**:
```
   k6_vus_max
```

3. **Visualization**: **"Stat"**

4. **Title**:
```
   K6 - Max Virtual Users
```

5. **Save**

---

### Panel 5: Logs de K6

1. **Add** → **Visualization**

2. **Data source**: Cambia a **`grafanacloud-marianahernandez1510202-logs`** (Loki, no Prometheus)

3. En lugar de "Metric", verás un campo de query. Escribe:
```
   {job="k6-load-tests"}
```

4. **Visualization**: **"Logs"**

5. **Title**:
```
   K6 Test Logs