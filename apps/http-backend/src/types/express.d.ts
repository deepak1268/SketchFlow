// somewhere global (e.g. src/types/express.d.ts)
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
