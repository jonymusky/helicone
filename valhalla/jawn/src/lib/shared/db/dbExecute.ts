import { Result } from "../result";
import { Pool } from "pg";
import { clickhouseDb } from "../../db/ClickhouseWrapper";

const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl:
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "development"
      ? {
          rejectUnauthorized: true,
          ca: process.env.SUPABASE_SSL_CERT_CONTENTS?.split("\\n").join("\n"),
        }
      : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export function paramsToValues(params: (number | string | boolean | Date)[]) {
  return params
    .map((p) => {
      if (p instanceof Date) {
        return p
          .toISOString()
          .replace("T", " ")
          .replace("Z", "")
          .replace(/\.\d+$/, "");
      } else {
        return p;
      }
    })
    .reduce((acc, parameter, index) => {
      return {
        ...acc,
        [`val_${index}`]: parameter,
      };
    }, {});
}

export function printRunnableQuery(
  query: string,
  parameters: (number | string | boolean | Date)[]
) {
  const queryParams = paramsToValues(parameters);
  const setParams = Object.entries(queryParams)
    .map(([key, value]) => `SET param_${key} = '${value}';`)
    .join("\n");

  console.log(`\n\n${setParams}\n\n${query}\n\n`);
}

// DEPRECATED
export async function dbQueryClickhouse<T>(
  query: string,
  parameters: (number | string | boolean | Date)[]
): Promise<Result<T[], string>> {
  return clickhouseDb.dbQuery<T>(query, parameters);
}

export async function dbExecute<T>(
  query: string,
  parameters: any[]
): Promise<Result<T[], string>> {
  if (!process.env.SUPABASE_DATABASE_URL) {
    console.error("SUPABASE_DATABASE_URL not set");
    return { data: null, error: "DATABASE_URL not set" };
  }

  console.log(`
  DB EXECUTE - Total Pool Count: ${pool.totalCount}
  DB EXECUTE - Idle Pool Count: ${pool.idleCount}
  DB EXECUTE - Waiting Pool Count: ${pool.waitingCount}
  `);

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(query, parameters);
      return { data: result.rows, error: null };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error executing query: ", query, parameters);
    console.error(err);
    return { data: null, error: JSON.stringify(err) };
  }
}
