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

// Spieler zeichnen (mit sichtbaren + und - Buttons)
function renderPlayers(players) {
    container.innerHTML = "";
    players.forEach(player => {
        // Container für den Spieler
        const playerDiv = document.createElement("div");
        playerDiv.className = "border";
        
        // Name
        const label = document.createElement("button");
        label.className = "plain1";
        label.textContent = player.name;

        // Minus-Button
        const btnMinus = document.createElement("button");
        btnMinus.className = "plain2"; // Wir nutzen dein bestehendes Design
        btnMinus.textContent = "-";
        btnMinus.style.cursor = "pointer"; // Zeigt die "Klick-Hand"
        btnMinus.onclick = async function() {
            player.score -= 1; 
            counter.textContent = player.score; // Sofort im Browser ändern
            await db.from('players').update({ score: player.score }).eq('id', player.id);
        };

        // Punktestand (Zähler)
        const counter = document.createElement("h3");
        counter.className = "plain1"; // Nur Text, kein Button-Hintergrund für die Zahl
        counter.textContent = player.score;
        counter.style.margin = "0 10px"; // Ein bisschen Abstand links und rechts

        // Plus-Button
        const btnPlus = document.createElement("button");
        btnPlus.className = "plain2";
        btnPlus.textContent = "+";
        btnPlus.style.cursor = "pointer";
        btnPlus.onclick = async function() {
            player.score += 1;
            counter.textContent = player.score; // Sofort im Browser ändern
            await db.from('players').update({ score: player.score }).eq('id', player.id);
        };

        // Alles in der richtigen Reihenfolge zusammenbauen
        playerDiv.appendChild(label);
        playerDiv.appendChild(btnMinus);
        playerDiv.appendChild(counter);
        playerDiv.appendChild(btnPlus);
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

// Alle Spieler löschen (Jetzt mit korrekter ID-Abfrage!)
async function deleteAllPlayers() {
    if(confirm("Bist du sicher, dass du ALLE Spieler löschen willst?")) {
        // Löscht alle Spieler, deren ID größer als 0 ist (also alle)
        const { error } = await db.from('players').delete().gt('id', 0);
        if (error) console.error("Fehler beim Löschen:", error);
    }
}

// Echtzeit-Updates empfangen
db.channel('public:players')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
    loadPlayers();
  })
  .subscribe();

loadPlayers();

