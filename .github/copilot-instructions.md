This project is set up for continuous deployment using GitHub Actions and PM2. On every push to the `main` branch, the following steps are executed:

1.  **Checkout Code:** The latest code is checked out from the `main` branch.
2.  **Set up Node.js:** A Node.js environment (version 20) is set up.
3.  **Install Dependencies:** All project dependencies are installed using `npm install`.
4.  **Build:** The project is built using `npm run build`. A dummy `DATABASE_URL` is provided to pass the build step.
5.  **Deploy with PM2:** The changes are deployed to the server using an SSH action. The script pulls the latest code, installs dependencies, builds the project, and restarts all PM2 processes.

To make this work, you need to add the following secrets to your GitHub repository:

*   `SSH_HOST`
*   `SSH_USERNAME`
*   `SSH_KEY`
*   `SSH_PORT`