# 📁 Architecture Overview

The flow for each request is simple and structured:

**Router → Controller → Function → Model**

---

## 🧩 Layer Responsibilities

### 📍 Controller
- Handles all error management.
- Errors are caught and propagated here.
- Neither the function nor the model layers handle errors directly.

### 🔐 Function
- Manages token operations: encryption, decryption, and JWT handling.
- Configures options related to authentication and security.
- Delegates data operations to the model layer.

### 🗄️ Model
- Interfaces directly with the database.
- Executes queries and handles data persistence.

---

## 📁 Folder Structure

Each layer in the application follows a consistent folder structure, making it easy to locate related files across the flow:

**Flow:** `Router → Controller → Function → Model`

For example, if you're working with the `user` route:

- `router/user/router.ts` → Defines the route for user-related endpoints.
- `controller/user/controller.ts` → Handles logic and error management for those routes.
- `function/user/function.ts` → Manages token operations, encryption, and calls the model.
- `model/user/model.ts` → Interfaces directly with the database for user data.

🔍 To find the corresponding controller or function for a specific route, simply follow the same path structure in the respective folder.

This modular and mirrored organization improves maintainability and developer experience.
