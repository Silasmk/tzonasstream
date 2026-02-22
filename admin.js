const supabaseUrl = 'https://mhfuxvyzkoiuhelivqsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZnV4dnl6a29pdWhlbGl2cXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjU4MTUsImV4cCI6MjA4NzM0MTgxNX0.HLhl_BR_7srww2oB1_abWU-UISnMkx40Fo-5WR2Of3s';
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

const container = document.getElementById("buttonContainer");
let currentPlayers = [];

// Spieler laden
async function loadPlayers() {
    const { data: players } = await supabase.from('players').select('*').order('created_at', { ascending: true });
    currentPlayers = players || [];
    renderPlayers(currentPlayers);
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
            await supabase.from('players').update({ score: player.score + 1 }).eq('id', player.id);
        };
        
        // Rechtsklick: Minus 1
        playerDiv.oncontextmenu = async function(event) {
            event.preventDefault();
            await supabase.from('players').update({ score: player.score - 1 }).eq('id', player.id);
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
        await supabase.from('players').insert([{ name: playerName, score: 0 }]);
        inputField.value = "";
    }
}

// Alle Spieler löschen (Achtung, löscht alles!)
async function deleteAllPlayers() {
    if(confirm("Bist du sicher, dass du ALLE Spieler löschen willst?")) {
        // Löscht alle Reihen, deren ID nicht null ist (also alle)
        await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
}

// Echtzeit-Updates empfangen
supabase
  .channel('public:players')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
    loadPlayers();
  })
  .subscribe();


loadPlayers();
