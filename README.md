
# Field Operations Tracking System Backend
A robust Node.js/Express backend for a Field Operations Tracking System. This system manages field agents, handles data submissions with automatic scoring and fraud detection, and provides analytics.


## 🚀 Features

-   **Agent Management**: Register and manage field agents.
-   **Data Submissions**: Secure submission endpoint with:
    -   **Auto-scoring**: Calculates quality scores based on completeness and accuracy.
    -   **Fraud Detection**: Detects GPS mismatches, high velocity, and duplicates.
-   **Analytics**: Aggregated insights by region(state), status, and category.
-   **API Documentation**: Integrated Swagger UI.


## 🛠️ Prerequisites

Ensure you have the following installed:
-   **[Node.js](https://nodejs.org/)** (v14 or higher)
-   **[PostgreSQL](https://www.postgresql.org/)** (v12 or higher)

##  setup and Installation

1.  **Clone the repository:**

    git clone <repository-url>
    cd server


2.  **Install dependencies:**

    npm install


3. ## 🗄️ Database installation &  Setup

 ### 🗄️ Database Setup Using pgAdmin 4 (GUI Method)

 ### 🔹 Step 1: Install PostgreSQL 

 Download and install PostgreSQL:

 https://www.postgresql.org/download/

 During installation:

- Default Port: `5432`
- Username: `postgres`
- Set and remember your password

 Verify installation:

```bash
 psql --version
```
- This method is useful for beginners who prefer a graphical interface instead of CLI.

### 🔹 Step 2: Open pgAdmin 4

 After installing PostgreSQL:
- Open **pgAdmin 4**
- Enter your **master password** (set during installation)

---

### 🔹 Step 3: Connect to Server

From the left sidebar: Servers → PostgreSQL → Databases
 If the server is not connected:
- Right click on **PostgreSQL**
- Click **Connect**
- Enter your **postgres password**

---

### 🔹 Step 4: Create New Database

1. Right click on **Databases**
2. Click **Create → Database**
3. Enter the following details: 
 - Database Name: field_ops_db
 - Owner: postgres
4. Click **Save**
- You will now see: field_ops_db in the Databases list.

---

### 🔹 Step 5: Open Query Tool

1. Click on: field_ops_db
2. Click **Query Tool** (top menu)

---

### 🔹 Step 6: Run SQL File

### Option A: Paste SQL Code
1. Open your `field_ops_db.sql` file
2. Copy the entire SQL code
3. Paste it inside the **Query Tool**
4. Click ▶ **Execute (Run button)**

---

### Option B: Directly Open SQL File
1. In Query Tool → Click **Open File**
2. Select `field_ops_db.sql`
3. Click ▶ **Execute**

---

### 🔹 Step 7: Verify Tables

After successful execution:
From left sidebar navigate to: Databases → field_ops_db → Schemas → public → Tables
You should see:
- `field_agents`
- `data_submissions`
Database setup using pgAdmin 4 is now complete. 
---


## 🗄️ Database Setup Using CLI (Migration Method)
### 🔹 Step 1: Install PostgreSQL

Download and install PostgreSQL:

https://www.postgresql.org/download/

During installation:

- Default Port: `5432`
- Username: `postgres`
- Set and remember your password

Verify installation:
 run these command on bash or terminal 
```
 psql --version
 ```

### 🔹 Step 2:  **Create the database using Command Line Tool (CLI):**
 run the command on bash or terminal
    ``` 
    psql -U postgres -c "CREATE DATABASE field_ops_db;"

    ```

### 🔹 Step 3:Run Migrations:**
 -   Connect to your database and execute the migration scripts in the `migrations/` folder in order:
    ` migrations/field_ops_db.sql ` (Creates initial schema)

   - Example using command line:
   -    run the command on bash or terminal
    ```
    psql -U postgres -d field_ops_db -f migrations/field_ops_db.sql
    Database setup using pgAdmin 4 is now complete.
    ```

3.  **Configure Environment Variables:**
    - After cloning the project and installing the dependencies and setup the database, go to the root folder (same level as package.json) 
    - Paste the following into the .env.example file Replace values with your own database credentials and then rename it from .env.example to .env
    - env
    PORT=5000
    DATABASE_URL=postgres://<username>:<password>@localhost:5432/<database_name>
    Example: postgres://postgres:your_password@localhost:5432/field_ops_db
    ```


##  Running the Server
-   **Development Mode** (with auto-reload):
-   run command on terminal:
    npm run dev


-   **Production Mode:**
-   run command on terminal:
    npm start
    The server will start at `http://localhost:5000`.

## 📚 API Documentation
The API is fully documented using Swagger. Once the server is running, visit:

 **[http://localhost:5000/api-docs]**


##  Project Structure
```
server/
├── migrations/         # SQL migration scripts
├── src/
│   ├── config/         # DB and Swagger config
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Validation logic
│   ├── models/         # Database queries
│   ├── routes/         # API route definitions
│   └── services/       # Business logic (Scoring, Fraud)
├── server.js           # Entry point
└── package.json        # Dependencies
```

## 🧪 Key Endpoints

-   `POST /api/agents` - Register a new agent
-   `GET /api/agents{id}` - Get agent profile details with submission summary stats
-   `GET /api/agents/{id}/submissions` - List all submissions by agent with pagination and filters
-   `POST /api/submissions` - Create a submission with auto-scoring and fraud detection
-   `GET /api/submissions/{id}` - Get submission details with score and fraud flags
-   `PATCH /api/submissions/{id}/verify` - Verify/Reject submission 
-   `GET /api/analytics/summary` - Get dashboard stats with analytics by region, status, and category
