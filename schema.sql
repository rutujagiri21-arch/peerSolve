-- ==========================================================
-- PeerSolve Database Schema
-- Academic Doubt-Solving Forum (Students & Seniors)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS peersolve_db;
USE peersolve_db;

-- 1. Users Table (Students and Seniors)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'senior') NOT NULL DEFAULT 'student',
  department VARCHAR(100) DEFAULT 'Computer Science',
  year VARCHAR(20) DEFAULT '2nd Year',
  reputation INT DEFAULT 0,
  avatar VARCHAR(10) DEFAULT '🎓',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Questions / Doubts Table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  code_snippet TEXT,
  tags VARCHAR(255),
  is_anonymous BOOLEAN DEFAULT FALSE,
  me_too_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  status ENUM('open', 'solved') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Answers Table (Multiple seniors can answer the same question)
CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  senior_id INT NOT NULL,
  content TEXT NOT NULL,
  code_snippet TEXT,
  is_best_answer BOOLEAN DEFAULT FALSE,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Me Too Votes (Prevent duplicate upvotes on questions)
CREATE TABLE IF NOT EXISTS me_too_votes (
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (question_id, user_id)
);

-- 5. Answer Upvotes
CREATE TABLE IF NOT EXISTS answer_votes (
  answer_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (answer_id, user_id)
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Reputation Audit Log Table
CREATE TABLE IF NOT EXISTS reputation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================================
-- Sample Seed Data (Matches the PeerSolve UI Screenshots)
-- Password for demo users: "password123"
-- (bcrypt hash: $2a$10$wO8yVzU3w.p6Z3q1zYmXfeX2w2E9oK0rL.7aG9d.r6hU/2aY5M9O.)
-- ==========================================================

INSERT IGNORE INTO users (id, name, username, email, password_hash, role, department, year, reputation, avatar)
VALUES
  (1, 'Aditya Sharma', 'aditya_senior', 'aditya@peersolve.edu', '$2a$10$7Z8q2qQf1aVwS2q7oB6r1.m6m5Z4w3x2y1A0b9c8d7e6f5g4h3i2j', 'senior', 'Computer Science', '4th Year', 2450, '👨‍💻'),
  (2, 'Neha Patel', 'neha_senior', 'neha@peersolve.edu', '$2a$10$7Z8q2qQf1aVwS2q7oB6r1.m6m5Z4w3x2y1A0b9c8d7e6f5g4h3i2j', 'senior', 'Information Technology', '3rd Year', 1820, '👩‍💻'),
  (3, 'Rohan Mehta', 'rohan_senior', 'rohan@peersolve.edu', '$2a$10$7Z8q2qQf1aVwS2q7oB6r1.m6m5Z4w3x2y1A0b9c8d7e6f5g4h3i2j', 'senior', 'Electronics & Telecom', '4th Year', 1240, '⚡'),
  (4, 'Rahul Verma', 'rahul_student', 'rahul@peersolve.edu', '$2a$10$7Z8q2qQf1aVwS2q7oB6r1.m6m5Z4w3x2y1A0b9c8d7e6f5g4h3i2j', 'student', 'Computer Science', '2nd Year', 85, '🎒'),
  (5, 'Ananya Iyer', 'ananya_student', 'ananya@peersolve.edu', '$2a$10$7Z8q2qQf1aVwS2q7oB6r1.m6m5Z4w3x2y1A0b9c8d7e6f5g4h3i2j', 'student', 'Computer Science', '1st Year', 40, '📚');

-- Sample Question (From your screenshot)
INSERT IGNORE INTO questions (id, user_id, subject, title, description, code_snippet, tags, is_anonymous, me_too_count, views_count, status, created_at)
VALUES
  (1, 4, 'DBMS', 'What is normalization in DBMS?', 'Can someone explain 1NF, 2NF and 3NF with a simple real-world college database example? I always get confused about transitive dependencies.', 
   '-- Example unnormalized table\nCREATE TABLE StudentCourses (\n  roll_no INT,\n  student_name VARCHAR(50),\n  course_id VARCHAR(10),\n  instructor_name VARCHAR(50)\n);',
   'dbms,normalization,sql,1nf,2nf,3nf', 0, 14, 180, 'solved', DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
  
  (2, 5, 'Data Structures', 'Why is QuickSort preferred over MergeSort for arrays?', 'In lecture we learned both have good complexity, but why is QuickSort often faster in practice for arrays in C++/Java? Also when should we use MergeSort?', 
   'void quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}',
   'algorithms,dsa,sorting,quicksort,mergesort', 0, 9, 95, 'open', DATE_SUB(NOW(), INTERVAL 1 HOUR)),

  (3, 4, 'Operating Systems', 'Difference between Deadlock Prevention and Deadlock Avoidance', 'Banker algorithm is used for avoidance, but why cant we just use prevention everywhere? What is the main disadvantage of prevention?',
   NULL, 'os,deadlock,bankers-algorithm,concurrency', 1, 19, 210, 'solved', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Sample Answer (From your screenshot)
INSERT IGNORE INTO answers (id, question_id, senior_id, content, code_snippet, is_best_answer, upvotes, created_at)
VALUES
  (1, 1, 1, 'Normalization is the systematic process of organizing data in a database to reduce data redundancy and improve data integrity.\n\nHere is a quick breakdown:\n1. **1NF (First Normal Form)**: Eliminate duplicate columns and ensure every cell contains atomic (single) values. No multi-valued attributes like "Phone: 9999, 8888".\n\n2. **2NF (Second Normal Form)**: Must be in 1NF + remove partial dependency (every non-key attribute must fully depend on the primary key).\n\n3. **3NF (Third Normal Form)**: Must be in 2NF + remove transitive dependency (non-key attributes cannot depend on other non-key attributes).\n\nRule of thumb: "The key, the whole key, and nothing but the key, so help me Codd!"', 
   '-- 3NF Normalized Tables\nCREATE TABLE Students (roll_no INT PRIMARY KEY, student_name VARCHAR(50));\nCREATE TABLE Courses (course_id VARCHAR(10) PRIMARY KEY, course_name VARCHAR(50), instructor_id INT);\nCREATE TABLE Enrollments (roll_no INT, course_id VARCHAR(10), PRIMARY KEY(roll_no, course_id));', 
   1, 38, DATE_SUB(NOW(), INTERVAL 1 MINUTE)),

  (2, 3, 2, 'Great question! The core trade-off comes down to **Resource Utilization vs Runtime Overhead**:\n\n- **Deadlock Prevention**: Eliminates one of Coffman four conditions (e.g., Hold & Wait, Mutual Exclusion, Circular Wait). Disadvantage: Severely restricts resource allocation, leading to very low hardware efficiency.\n\n- **Deadlock Avoidance (e.g. Banker Algorithm)**: Allows requests dynamically but checks if granting keeps the system in a "Safe State". Disadvantage: Requires knowing all future resource requests in advance, which is rarely possible in general OS.',
   NULL, 1, 24, DATE_SUB(NOW(), INTERVAL 2 HOUR));
