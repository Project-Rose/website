const STATUS_URL = "https://projectrose.montastic.io/";

export default async function handler(req) {
  try {
    const res = await fetch(STATUS_URL, {
      headers: { "User-Agent": "ProjectRose-Site/1.0" },
    });

    if (!res.ok) {
      throw new Error(`Montastic returned ${res.status}`);
    }

    const html = await res.text();

    // Parse Montastic HTML using card boundary splitting
    const services = [];
    const cards = html.split('<div class="card p-3"');

    for (let i = 1; i < cards.length; i++) {
      const card = cards[i];
      const nameMatch = card.match(/<span class="checkpoint-title">([^<]*)<\/span>/);
      const statusMatch = card.match(/<strong>([^<]*)<\/strong>/);
      if (nameMatch && statusMatch) {
        services.push({
          name: nameMatch[1].trim(),
          status: statusMatch[1].trim().toLowerCase(),
        });
      }
    }

    if (services.length === 0) {
      console.warn("Montastic parsing returned 0 services – HTML structure may have changed");
    }

    const hasDown = services.some((s) => s.status === "down");
    const hasIssues = services.some(
      (s) => s.status !== "operational" && s.status !== "down"
    );

    let overall = "operational";
    if (hasDown) {
      overall = "down";
    } else if (hasIssues) {
      overall = "issues";
    }

    const degraded =
      overall === "operational"
        ? null
        : services
            .filter((s) => s.status !== "operational")
            .map((s) => `${s.name}: ${s.status}`)
            .join("; ");

    return new Response(
      JSON.stringify({ overall, services, degraded }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        overall: "unknown",
        services: [],
        degraded: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
