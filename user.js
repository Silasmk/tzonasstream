// Hier kommen später deine echten Supabase-Daten rein
const supabaseUrl = 'DEINE_SUPABASE_URL';
const supabaseKey = 'DEIN_SUPABASE_ANON_KEY';
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

const container = document.getElementById("buttonContainer");

// Spieler aus der Datenbank laden und anzeigen
async function loadPlayers() {
    const { data: players } = await supabase.from('players').select('*').order('created_at', { ascending: true });
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
        // WICHTIG: Keine onclick-Events hier, da User nur zuschauen!

        playerDiv.appendChild(label);
        playerDiv.appendChild(counter);
        container.appendChild(playerDiv);
    });
}

// Auf Echtzeit-Änderungen von Supabase lauschen
supabase
  .channel('public:players')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
    // Sobald sich was ändert, laden wir die Liste einfach neu
    loadPlayers();
  })
  .subscribe();

// Beim Start einmal alles laden
loadPlayers();