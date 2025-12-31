-- Seed Data for Unmask Demo
-- Run this after creating your tables to populate with sample requests

-- Note: You'll need to replace the student_id UUIDs with actual user IDs from your auth.users table
-- Or create test users first, then use their IDs

-- First, let's create some sample requests (you'll need to update student_id with real IDs)
-- To get a real student_id, sign up as a student first, then copy their user ID from auth.users

-- Example: Insert sample requests
-- Replace 'YOUR_STUDENT_ID_HERE' with an actual student user ID from your database

INSERT INTO requests (
  student_id,
  title,
  subject,
  description,
  curriculum_link,
  exam_date,
  budget_min,
  budget_max,
  status
) VALUES
-- Request 1: DBMS
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Help with Database Management Systems Midterm',
  'Database Management Systems',
  'Need help covering:
- ER Diagrams and Normalization
- SQL Queries (JOINs, Subqueries, Aggregations)
- Transaction Management and ACID properties
- Indexing and Query Optimization

Exam is in 2 weeks. Looking for someone who can help me understand the concepts and solve practice problems.',
  'https://drive.google.com/file/d/example1/view',
  CURRENT_DATE + INTERVAL '14 days',
  500,
  1500,
  'open'
),
-- Request 2: Algorithms
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Data Structures and Algorithms Final Exam Prep',
  'Algorithms and Data Structures',
  'Topics to cover:
- Dynamic Programming (Knapsack, LCS, Edit Distance)
- Graph Algorithms (DFS, BFS, Dijkstra, MST)
- Sorting and Searching Algorithms
- Time Complexity Analysis

Need someone with strong problem-solving skills. Will share past papers.',
  'https://drive.google.com/file/d/example2/view',
  CURRENT_DATE + INTERVAL '21 days',
  800,
  2000,
  'open'
),
-- Request 3: Mathematics
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Linear Algebra and Calculus Crash Course',
  'Mathematics',
  'Struggling with:
- Matrix operations and determinants
- Eigenvalues and eigenvectors
- Limits, derivatives, and integrals
- Multivariable calculus basics

Exam in 10 days. Need intensive sessions.',
  NULL,
  CURRENT_DATE + INTERVAL '10 days',
  600,
  1800,
  'open'
),
-- Request 4: Operating Systems
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Operating Systems Concepts - Process Scheduling',
  'Operating Systems',
  'Focus areas:
- Process scheduling algorithms (FCFS, SJF, Round Robin, Priority)
- Deadlock detection and prevention
- Memory management (Paging, Segmentation)
- File system concepts

Have syllabus PDF ready to share.',
  'https://drive.google.com/file/d/example4/view',
  CURRENT_DATE + INTERVAL '18 days',
  700,
  1600,
  'open'
),
-- Request 5: Computer Networks
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Computer Networks - TCP/IP and Routing',
  'Computer Networks',
  'Need help with:
- OSI and TCP/IP models
- Routing algorithms (Distance Vector, Link State)
- TCP congestion control
- Network security basics

Exam in 2 weeks. Prefer someone with industry experience.',
  NULL,
  CURRENT_DATE + INTERVAL '14 days',
  900,
  2200,
  'open'
),
-- Request 6: Machine Learning
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Machine Learning Fundamentals',
  'Machine Learning',
  'Topics:
- Supervised learning (Linear Regression, Logistic Regression, SVM)
- Unsupervised learning (K-means, PCA)
- Neural Networks basics
- Model evaluation metrics

Have course materials and need practical examples.',
  'https://drive.google.com/file/d/example6/view',
  CURRENT_DATE + INTERVAL '25 days',
  1000,
  2500,
  'open'
),
-- Request 7: Software Engineering
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Software Engineering - Design Patterns',
  'Software Engineering',
  'Need to understand:
- Creational patterns (Singleton, Factory)
- Structural patterns (Adapter, Decorator)
- Behavioral patterns (Observer, Strategy)
- UML diagrams

Exam in 3 weeks. Looking for hands-on coding examples.',
  NULL,
  CURRENT_DATE + INTERVAL '21 days',
  600,
  1500,
  'open'
),
-- Request 8: Web Development
(
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Full Stack Web Development - React and Node.js',
  'Web Development',
  'Focus on:
- React hooks and state management
- RESTful API design
- Database integration (MongoDB/PostgreSQL)
- Authentication and authorization

Project-based learning preferred. Exam in 4 weeks.',
  'https://drive.google.com/file/d/example8/view',
  CURRENT_DATE + INTERVAL '28 days',
  1200,
  3000,
  'open'
);

-- Note: After running this, you may want to create some sample offers too
-- But for now, educators can create offers through the UI

