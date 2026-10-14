# ShopKart Labs

Six progressive MERN practice projects, from customer authentication through product browsing, wishlist, cart, and Razorpay test checkout.

| Folder | Project |
| --- | --- |
| `lab_1` | Customer registration and login API |
| `lab_2` | Authentication API and React UI |
| `lab_3` | Product catalog |
| `lab_4` | Wishlist |
| `lab_5` | Shopping cart |
| `lab_6` | Orders and Razorpay test checkout |

Each lab is self-contained. Run commands from the folder shown; install frontend and backend dependencies separately where both exist.

## Requirements

- Node.js 20 or newer and npm
- Docker Desktop with Docker Compose
- Postman (optional, for the API collections in each lab's `api/` folder)
- Razorpay test credentials for Lab 6 checkout

## Run a lab

For Labs 2–5, configure the backend and install dependencies:

```sh
cd lab_3/backend # choose lab_2 through lab_6
cp .env.example .env
npm install
npm run mongo
```

Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`. Keep these values private.

In one terminal, start the API:

```sh
cd lab_3/backend # same lab as above
npm run dev
```

In another terminal, start the frontend:

```sh
cd lab_3/frontend # same lab as above
npm install
npm run dev
```

Open the local URL printed by Vite.

Lab 6 needs `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `lab_6/backend/.env`; use Razorpay Test Mode credentials. Install dependencies in both `lab_6/backend` and `lab_6/frontend`, copy `lab_6/backend/.env.example` to `lab_6/backend/.env`, then run `npm run dev` from `lab_6/frontend`. This starts MongoDB, the API, and Vite together.

Lab 1 is backend-only:

```sh
cd lab_1
cp .env.example .env
npm install
npm run mongo
npm run dev
```

## API collections

Each applicable lab includes Postman collections and environments under `api/`. Import the collection and matching environment, start that lab's API and database, then run the requests in order. Lab 6 payment verification also requires completing a test checkout in the frontend.

## Secrets and GitHub submission

`.env` files, dependencies, build output, and local code-index data are ignored by Git. Commit the `.env.example` templates, source, lockfiles, Postman artifacts, and this README. Never commit real credentials. If a secret was previously pushed, rotate it; adding it to `.gitignore` does not remove it from Git history.

This directory currently has no Git repository or configured remote. Initialize or connect it to your GitHub repository, review `git status` for local files, then push the branch to produce the repository link required for submission.
