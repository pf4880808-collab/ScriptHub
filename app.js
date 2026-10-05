let resources = [];
let currentFilter = "all";
let favorites =
    JSON.parse(localStorage.getItem("scriptHubFavorites") || "[]");

async function loadResources() {
    const status = document.getElementById("status");

    status.textContent = "🔄 Carregando recursos...";

    try {
        const response = await fetch("./database.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("database.json não encontrado");
        }

        resources = await response.json();

        render();

        status.textContent =
            `${resources.length} recurso(s) disponível(is).`;

    } catch (error) {
        console.error(error);

        status.textContent =
            "❌ Não foi possível carregar o banco de recursos.";
    }
}

function render() {
    const container =
        document.getElementById("results");

    container.innerHTML = "";

    const search =
        document
            .getElementById("search")
            .value
            .trim()
            .toLowerCase();

    let filtered = resources.filter(item => {

        const matchesSearch =
            !search ||
            String(item.name || "").toLowerCase().includes(search) ||
            String(item.game || "").toLowerCase().includes(search) ||
            String(item.description || "").toLowerCase().includes(search);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "favorites" &&
                favorites.includes(item.source)) ||
            item.key === currentFilter;

        return matchesSearch && matchesFilter;
    });

    if (!filtered.length) {
        container.innerHTML = `
            <div class="card empty">
                <h3>Nada encontrado</h3>
                <p>
                    Tente outro termo ou altere o filtro.
                </p>
            </div>
        `;
        return;
    }

    filtered.forEach(item => {

        const card =
            document.createElement("article");

        card.className = "card";

        const isFavorite =
            favorites.includes(item.source);

        let badgeClass = "";

        if (item.key === "No Key") {
            badgeClass = "nokey";
        }

        if (item.key === "Key System") {
            badgeClass = "key";
        }

        const loadstring =
            item.loadstring || "";

        card.innerHTML = `

            <div class="card-top">

                <div>
                    <h3>
                        ${escapeHtml(item.name)}
                    </h3>

                    <span class="game">
                        🎮 ${escapeHtml(item.game || "Roblox")}
                    </span>
                </div>

                <button
                    class="favorite"
                    onclick="toggleFavorite('${escapeAttribute(item.source)}')"
                >
                    ${isFavorite ? "♥" : "♡"}
                </button>

            </div>

            <p>
                ${escapeHtml(
                    item.description ||
                    "Sem descrição."
                )}
            </p>

            <div class="meta">

                <span class="badge">
                    ${escapeHtml(item.type || "Recurso")}
                </span>

                <span class="badge ${badgeClass}">
                    ${escapeHtml(item.key || "Unknown")}
                </span>

                ${
                    item.official
                    ?
                    `<span class="badge official">
                        ✓ Oficial
                    </span>`
                    :
                    ""
                }

            </div>

            <div class="actions">

                ${
                    item.code
                    ?
                    `<button
                        onclick="copyText(this)"
                        data-copy="${escapeAttribute(item.code)}"
                    >
                        📋 Código
                    </button>`
                    :
                    ""
                }

                ${
                    loadstring
                    ?
                    `<button
                        onclick="copyText(this)"
                        data-copy="${escapeAttribute(loadstring)}"
                    >
                        ⚡ Loadstring
                    </button>`
                    :
                    ""
                }

                ${
                    item.source
                    ?
                    `<a
                        href="${escapeAttribute(item.source)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        🔗 Fonte
                    </a>`
                    :
                    ""
                }

            </div>
        `;

        container.appendChild(card);
    });
}

function searchResources() {
    render();
}

function setFilter(filter) {
    currentFilter = filter;
    render();
}

function toggleFavorite(source) {

    if (favorites.includes(source)) {

        favorites =
            favorites.filter(
                item => item !== source
            );

    } else {

        favorites.push(source);
    }

    localStorage.setItem(
        "scriptHubFavorites",
        JSON.stringify(favorites)
    );

    render();
}

async function copyText(button) {

    const text = button.dataset.copy;

    try {

        await navigator.clipboard.writeText(text);

        const old = button.textContent;

        button.textContent = "✓ Copiado!";

        setTimeout(() => {
            button.textContent = old;
        }, 1500);

    } catch {

        alert("Não foi possível copiar.");
    }
}

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {

    return escapeHtml(value)
        .replaceAll("`", "&#096;");
}

document
    .getElementById("search")
    .addEventListener("input", render);

document
    .getElementById("search")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {
            render();
        }
    });

loadResources();
