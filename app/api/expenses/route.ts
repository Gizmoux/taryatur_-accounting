// app/api/expenses/route.ts

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bus_id = searchParams.get("bus_id");
  const month = searchParams.get("month");
  console.log("Requête reçue pour bus_id:", bus_id, "et month:", month);
  try {
    const client = await pool.connect();
    const query = "SELECT * FROM busexpenses WHERE bus_id = $1 AND month = $2";
    const values = [bus_id, month];

    const result = await client.query(query, values);
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des dépenses" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    await pool.query("SELECT NOW()");
    console.log("Connexion à la base de données réussie");
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    return NextResponse.json(
      { error: "Erreur de connexion à la base de données" },
      { status: 500 }
    );
  }

  try {
    const expenses = await request.json();

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json(
        { error: "Les données doivent être un tableau non vide de dépenses" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const results = [];
      for (const expense of expenses) {
        const { bus_id, type, month, amount } = expense;

        if (!bus_id || !type || !month || amount === undefined) {
          return NextResponse.json(
            { error: "Tous les champs sont requis pour chaque dépense" },
            { status: 400 }
          );
        }

        const result = await client.query(
          "INSERT INTO busexpenses (bus_id, type, month, amount) VALUES ($1, $2, $3, $4) RETURNING id",
          [bus_id, type, month, amount]
        );
        results.push(result.rows[0].id);
      }

      return NextResponse.json(
        { message: "Dépenses enregistrées avec succès", ids: results },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des dépenses:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
