import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const ALLOWED_ORIGINS = [
  'https://uni-key.ch',
  'https://www.uni-key.ch',
  'https://unikey.lovable.app',
  'https://id-preview--8630e333-bd64-418b-b58e-5a1f7997dc70.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token for auth check
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: roleData } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { caseId, clientName } = await req.json();
    if (!caseId) {
      return new Response(JSON.stringify({ error: "caseId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for storage access
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch documents for this case
    const { data: documents, error: docsError } = await serviceClient
      .from("case_documents")
      .select("id, label, document_type, file_url, status")
      .eq("case_id", caseId)
      .not("file_url", "is", null);

    if (docsError) {
      console.error("Error fetching documents:", docsError);
      return new Response(JSON.stringify({ error: "Failed to fetch documents" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ error: "No documents to download" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Creating ZIP for case ${caseId} with ${documents.length} documents`);

    // Create ZIP
    const zip = new JSZip();

    for (const doc of documents) {
      if (!doc.file_url) continue;

      try {
        // Extract bucket and path from URL
        const url = new URL(doc.file_url);
        const parts = url.pathname.split("/").filter(Boolean);
        const objectIdx = parts.findIndex((p) => p === "object");
        
        if (objectIdx === -1) {
          console.warn(`Could not parse URL for doc ${doc.id}: ${doc.file_url}`);
          continue;
        }

        const bucket = parts[objectIdx + 2];
        const pathParts = parts.slice(objectIdx + 3);
        const filePath = decodeURIComponent(pathParts.join("/"));
        const originalExt = filePath.split(".").pop() || "pdf";

        // Download from storage
        const { data: fileData, error: downloadError } = await serviceClient.storage
          .from(bucket)
          .download(filePath);

        if (downloadError) {
          console.error(`Error downloading ${doc.label}:`, downloadError);
          continue;
        }

        // Create safe filename
        const safeLabel = doc.label.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
        const fileName = `${safeLabel}.${originalExt}`;

        // Add to ZIP
        const arrayBuffer = await fileData.arrayBuffer();
        zip.file(fileName, arrayBuffer);

        console.log(`Added ${fileName} to ZIP`);
      } catch (err) {
        console.error(`Error processing doc ${doc.id}:`, err);
      }
    }

    // Generate ZIP file as blob
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Create filename
    const safeClientName = (clientName || "client")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const dateStr = new Date().toISOString().split("T")[0];
    const zipFileName = `${safeClientName}_dossier_${dateStr}.zip`;

    console.log(`ZIP created: ${zipFileName} (${zipBlob.size} bytes)`);

    return new Response(zipBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (err) {
    console.error("Error generating ZIP:", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate ZIP" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
