// app/api/clients/route.ts

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
  const clientId = searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json(
      { error: "Client ID is required" },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    const query = "SELECT * FROM clients WHERE id = $1";
    const values = [clientId];

    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching client data:", error);
    return NextResponse.json(
      { error: "Error fetching client data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const clientData = await request.json();

    const client = await pool.connect();
    try {
      let query;
      let values;

      if (clientData.client_id) {
        // Update existing client
        query = `
          UPDATE clients
          SET nom = $1, prenom = $2, tel_no = $3, bus = $4, lieu_ramassage = $5,
              lieu_depose = $6, montant_du = $7, montant_paye = $8, date_paiement = $9,
              type_reglement = $10, reste_a_payer = $11, num_facture = $12, commentaire = $13
          WHERE id = $14
          RETURNING *
        `;
        values = [
          clientData.NOM,
          clientData.PRENOM,
          clientData.TEL_NO,
          clientData.BUS,
          clientData.LIEU_RAMASSAGE,
          clientData.LIEU_DEPOSE,
          clientData.MONTANT_DU,
          clientData.MONTANT_PAYE,
          clientData.DATE_PAIEMENT,
          clientData.TYPE_REGLEMENT,
          clientData.RESTE_A_PAYER,
          clientData.NUM_FACTURE,
          clientData.COMMENTAIRE,
          clientData.client_id,
        ];
      } else {
        // Insert new client
        query = `
          INSERT INTO clients (nom, prenom, tel_no, bus, lieu_ramassage, lieu_depose,
                               montant_du, montant_paye, date_paiement, type_reglement,
                               reste_a_payer, num_facture, commentaire)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `;
        values = [
          clientData.NOM,
          clientData.PRENOM,
          clientData.TEL_NO,
          clientData.BUS,
          clientData.LIEU_RAMASSAGE,
          clientData.LIEU_DEPOSE,
          clientData.MONTANT_DU,
          clientData.MONTANT_PAYE,
          clientData.DATE_PAIEMENT,
          clientData.TYPE_REGLEMENT,
          clientData.RESTE_A_PAYER,
          clientData.NUM_FACTURE,
          clientData.COMMENTAIRE,
        ];
      }

      const result = await client.query(query, values);
      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error saving client data:", error);
    return NextResponse.json(
      { error: "Error saving client data" },
      { status: 500 }
    );
  }
}
