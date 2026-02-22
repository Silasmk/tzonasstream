// Hier kommen später deine echten Supabase-Daten rein
const supabaseUrl = 'https://mhfuxvyzkoiuhelivqsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZnV4dnl6a29pdWhlbGl2cXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjU4MTUsImV4cCI6MjA4NzM0MTgxNX0.HLhl_BR_7srww2oB1_abWU-UISnMkx40Fo-5WR2Of3s';
// HIER IST DIE ÄNDERUNG: "db" statt "supabase"
const db = supabase.createClient(supabaseUrl, supabaseKey);

const container = document.getElementById("buttonContainer");

// Spieler aus der Datenbank laden und anzeigen
async function loadPlayers() {
    const { data: players } = await db.from('players').select('*').order('created_at', { ascending: true });
    renderPlayers(players);
}

// Spieler auf dem Bildschirm zeichnen (Ohne Klick-Funktionen!)
function renderPlayers(players) {
    container.innerHTML = "";
    if (!players) return;

    players.forEach(player => {
        const label = document.createElement("button");
        label.className = "plain1";
        label.textContent = player.name;

        const counter = document.createElement("h3");
        counter.className = "plain2";
        counter.textContent = player.score;

        const playerDiv = document.createElement("div");
        playerDiv.className = "border";

        playerDiv.appendChild(label);
        playerDiv.appendChild(counter);
        container.appendChild(playerDiv);
    });
}

// Auf Echtzeit-Änderungen von Supabase lauschen
db.channel('public:players')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
    loadPlayers();
  })
  .subscribe();

// Beim Start einmal alles laden
loadPlayers();
