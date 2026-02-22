const supabaseUrl = 'https://mhfuxvyzkoiuhelivqsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZnV4dnl6a29pdWhlbGl2cXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjU4MTUsImV4cCI6MjA4NzM0MTgxNX0.HLhl_BR_7srww2oB1_abWU-UISnMkx40Fo-5WR2Of3s';

const db = supabase.createClient(supabaseUrl, supabaseKey);

const container = document.getElementById("buttonContainer");

// Spieler laden
async function loadPlayers() {
    const { data: players, error } = await db.from('players').select('*').order('created_at', { ascending: true });
    if (error) console.error("Fehler beim Laden:", error);
    renderPlayers(players || []);
}

// Spieler zeichnen (MIT Klick-Funktionen)
function renderPlayers(players) {
    container.innerHTML = "";
    players.forEach(player => {
        const label = document.createElement("button");
        label.className = "plain1";
        label.textContent = player.name;

        const counter = document.createElement("h3");
        counter.className = "plain2";
        counter.textContent = player.score;

        const playerDiv = document.createElement("div");
        playerDiv.className = "border";
        
        // Linksklick: Plus 1
        playerDiv.onclick = async function() {
            player.score += 1; // Zahl sofort auf dem Bildschirm ändern
            counter.textContent = player.score;
            const { error } = await db.from('players').update({ score: player.score }).eq('id', player.id);
            if (error) console.error("Fehler beim Plus-Rechnen:", error);
        };
        
        // Rechtsklick: Minus 1
        playerDiv.oncontextmenu = async function(event) {
            event.preventDefault(); // Verhindert das Browser-Menü
            player.score -= 1; // Zahl sofort auf dem Bildschirm ändern
            counter.textContent = player.score;
            const { error } = await db.from('players').update({ score: player.score }).eq('id', player.id);
            if (error) console.error("Fehler beim Minus-Rechnen:", error);
        };

        playerDiv.appendChild(label);
        playerDiv.appendChild(counter);
        container.appendChild(playerDiv);
    });
}

// Neuen Spieler hinzufügen
async function addPlayer() {
    const inputField = document.getElementById("input");
    const playerName = inputField.value.trim();

    if (playerName !== "") {
        const { error } = await db.from('players').insert([{ name: playerName, score: 0 }]);
        if (error) console.error("Fehler beim Erstellen:", error);
        inputField.value = "";
    }
}

// Alle Spieler löschen
async function deleteAllPlayers() {
    if(confirm("Bist du sicher, dass du ALLE Spieler löschen willst?")) {
        // Sichere Methode, um wirklich alle zu löschen
        const { error } = await db.from('players').delete().not('id', 'is', null);
        if (error) console.error("Fehler beim Löschen:", error);
    }
}

// Echtzeit-Updates empfangen
db.channel('public:players')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
    // Nur neu laden, wenn es nicht von uns selbst kommt, sonst flackert es
    loadPlayers();
  })
  .subscribe();

loadPlayers();
