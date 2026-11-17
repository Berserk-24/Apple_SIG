        function reveal() {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 100; // Cuántos pixeles antes de aparecer
                
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        
        // Ejecutar al hacer scroll
        window.addEventListener("scroll", reveal);
        // Ejecutar una vez al cargar por si elementos ya están en pantalla
        reveal();

        var cuts = {
            1: {
                title: "Corte 1",
                sections: [
                    { id: "entradas-salidas", label: "Entradas y salidas" },
                    { id: "partes-interesadas", label: "Partes interesadas" },
                    { id: "matriz-raci", label: "Matriz RACI" },
                    { id: "pestel", label: "Diagrama PESTEL" },
                    { id: "procesos", label: "Mapa de procesos" },
                    { id: "politica", label: "Política de Apple" }
                ]
            },
            2: {
                title: "Corte 2",
                sections: [
                    { id: "aspectos-impactos", label: "Aspectos e impactos ambientales" },
                    { id: "amenazas-activos", label: "Amenazas y activos" },
                    { id: "riesgos-calidad", label: "Riesgos de calidad" },
                    { id: "riesgos-seguridad", label: "Riesgos de seguridad" }
                ]
            },
            3: {
                title: "Corte 3",
                sections: [
                    { id: "competencias-altos-mandos", label: "Competencias directivas" },
                    { id: "sgsst-phva", label: "SGSST · ciclo PHVA" },
                    { id: "seguimiento-medicion", label: "Seguimiento y medición" },
                    { id: "emergencias-desastres", label: "Emergencias naturales" },
                    { id: "control-operacional", label: "Control operacional" },
                    { id: "controles-emergencia-proceso", label: "Controles de emergencia por proceso" }
                ]
            }
        };
        var activeCut = 1;
        var activeSection = cuts[1].sections[0].id;
        var cutPicker = document.getElementById("cutPicker");
        var innerNav = document.getElementById("innerNav");
        var innerNavItems = document.getElementById("innerNavItems");
        var currentCutLabel = document.getElementById("currentCutLabel");
        var activeSectionFramePending = false;

        function renderSectionNav(cut) {
            innerNavItems.replaceChildren();

            cut.sections.forEach(function (section, index) {
                var link = document.createElement("a");
                link.className = "nav-item";
                link.href = "#" + section.id;
                link.setAttribute("data-section", section.id);

                var count = document.createElement("span");
                count.className = "nav-item-count";
                count.textContent = String(index + 1).padStart(2, "0");

                var label = document.createElement("span");
                label.textContent = section.label;

                link.append(count, label);
                innerNavItems.appendChild(link);
            });
        }

        function setActiveSection(sectionId) {
            activeSection = sectionId;
            var navItems = innerNavItems.querySelectorAll(".nav-item[data-section]");

            for (var i = 0; i < navItems.length; i++) {
                var isActive = navItems[i].getAttribute("data-section") === sectionId;
                navItems[i].classList.toggle("active", isActive);

                if (isActive) {
                    navItems[i].setAttribute("aria-current", "location");
                } else {
                    navItems[i].removeAttribute("aria-current");
                }
            }
        }

        function updateActiveSectionFromViewport() {
            var sections = cuts[activeCut].sections;
            if (!sections.length) {
                return;
            }

            var nav = document.querySelector(".spa-nav");
            var marker = Math.max(nav ? nav.offsetHeight + 30 : 160, window.innerHeight * 0.35);
            var currentId = sections[0].id;
            for (var i = 0; i < sections.length; i++) {
                var section = document.getElementById(sections[i].id);
                if (section && section.getBoundingClientRect().top <= marker) {
                    currentId = sections[i].id;
                } else {
                    break;
                }
            }
            setActiveSection(currentId);
        }

        function animatePanel(panel) {
            panel.classList.remove("cut-panel-enter");
            window.requestAnimationFrame(function () {
                panel.classList.add("cut-panel-enter");
            });
        }

        function openCut(cutId, updateAddress, shouldScroll) {
            var nextCut = cuts[cutId];
            if (!nextCut) {
                return;
            }

            activeCut = cutId;
            currentCutLabel.textContent = nextCut.title;
            innerNavItems.hidden = nextCut.sections.length === 0;
            renderSectionNav(nextCut);

            var contentPanels = document.querySelectorAll("[data-cut-content]");
            for (var i = 0; i < contentPanels.length; i++) {
                var isCurrent = Number(contentPanels[i].getAttribute("data-cut-content")) === cutId;
                contentPanels[i].hidden = !isCurrent;
                if (isCurrent) {
                    animatePanel(contentPanels[i]);
                }
            }

            var cutButtons = cutPicker.querySelectorAll("[data-cut]");
            for (var j = 0; j < cutButtons.length; j++) {
                var isCurrentCut = Number(cutButtons[j].getAttribute("data-cut")) === cutId;
                cutButtons[j].classList.toggle("is-current", isCurrentCut);
                cutButtons[j].setAttribute("aria-pressed", isCurrentCut ? "true" : "false");
            }

            cutPicker.hidden = true;
            innerNav.hidden = false;
            document.getElementById("showCutPicker").setAttribute("aria-expanded", "false");
            setActiveSection(nextCut.sections.length ? nextCut.sections[0].id : "");
            updateActiveSectionFromViewport();
            reveal();

            if (updateAddress) {
                history.replaceState(null, "", "#corte-" + cutId);
            }

            if (shouldScroll) {
                var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
            }
        }

        document.getElementById("showCutPicker").addEventListener("click", function () {
            cutPicker.hidden = false;
            innerNav.hidden = true;
            this.setAttribute("aria-expanded", "true");
            animatePanel(cutPicker);
        });

        var cutButtons = cutPicker.querySelectorAll("[data-cut]");
        for (var j = 0; j < cutButtons.length; j++) {
            cutButtons[j].addEventListener("click", function () {
                openCut(Number(this.getAttribute("data-cut")), true, true);
            });
        }

        document.getElementById("nextCut").addEventListener("click", function () {
            openCut(activeCut === 3 ? 1 : activeCut + 1, true, true);
        });

        window.addEventListener("scroll", function () {
            if (activeSectionFramePending) {
                return;
            }

            activeSectionFramePending = true;
            window.requestAnimationFrame(function () {
                activeSectionFramePending = false;
                updateActiveSectionFromViewport();
            });
        });

        innerNavItems.addEventListener("click", function (event) {
            var link = event.target.closest(".nav-item[data-section]");
            if (!link) {
                return;
            }

            var sectionId = link.getAttribute("data-section");
            var target = document.getElementById(sectionId);
            if (!target || !cuts[activeCut].sections.some(function (section) { return section.id === sectionId; })) {
                return;
            }

            event.preventDefault();
            setActiveSection(sectionId);

            var nav = document.querySelector(".spa-nav");
            var navHeight = nav ? nav.offsetHeight : 0;
            var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 22;
            var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
            history.replaceState(null, "", "#" + sectionId);
        });

        var initialHash = window.location.hash;
        var initialCutMatch = initialHash.match(/^#corte-([1-3])$/);
        if (initialCutMatch) {
            openCut(Number(initialCutMatch[1]), false, false);
        } else {
            var initialSection = initialHash.slice(1);
            var initialCutId = Object.keys(cuts).find(function (cutId) {
                return cuts[cutId].sections.some(function (section) { return section.id === initialSection; });
            });

            if (initialCutId) {
                openCut(Number(initialCutId), false, false);
                setActiveSection(initialSection);
                if (Number(initialCutId) !== 1) {
                    var initialTarget = document.getElementById(initialSection);
                    var nav = document.querySelector(".spa-nav");
                    var navHeight = nav ? nav.offsetHeight : 0;
                    window.scrollTo(0, initialTarget.getBoundingClientRect().top + window.scrollY - navHeight - 22);
                }
            } else {
                renderSectionNav(cuts[1]);
                setActiveSection(cuts[1].sections[0].id);
            }
            updateActiveSectionFromViewport();
        }

        var modal = document.getElementById("imageModal");
        var modalImg = document.getElementById("expandedImg");
        var closeBtn = document.querySelector(".close-btn");
        var images = document.querySelectorAll(".image-placeholder img");
        var infografiaTab = document.getElementById("abrirInfografia");

        function openModalWithImage(src, altText) {
            if (!modal || !modalImg) {
                return;
            }

            modal.style.display = "flex";
            modal.setAttribute("aria-hidden", "false");
            modalImg.src = src;
            modalImg.alt = altText || "Vista ampliada";
            document.body.style.overflow = "hidden";
            requestAnimationFrame(function () {
                modal.classList.add("show");
            });
        }

        function closeModal() {
            if (!modal) {
                return;
            }

            modal.classList.remove("show");
            document.body.style.overflow = "";
            setTimeout(function () {
                modal.style.display = "none";
                modal.setAttribute("aria-hidden", "true");
            }, 300);
        }

        for (var k = 0; k < images.length; k++) {
            images[k].addEventListener("click", function () {
                openModalWithImage(this.src, this.alt || "Vista ampliada");
            });
        }

        if (infografiaTab) {
            infografiaTab.addEventListener("click", function () {
                openModalWithImage("resources/infografia.png", "Infografia de Apple");
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }

        if (modal) {
            modal.addEventListener("click", function (event) {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal && modal.classList.contains("show")) {
                closeModal();
            }
        });

        var sgsstMonths = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        var sgsstMetrics = [
            {
                name: "Frecuencia de accidentalidad",
                target: 0.5,
                comparator: "≤",
                values: [1.2, 1.1, 1.2, 1.0, 0.9, 0.8, 0.7, 0.6, 0.6, 0.5, 0.4, 0.4],
                periods: sgsstMonths,
                frequency: "Mensual",
                direction: "max",
                color: "#5B21B6"
            },
            {
                name: "Ausentismo por causa médica",
                target: 3.0,
                comparator: "≤",
                values: [4.8, 4.7, 4.9, 4.5, 4.2, 4.0, 3.8, 3.5, 3.3, 3.1, 2.9, 2.8],
                periods: sgsstMonths,
                frequency: "Mensual",
                direction: "max",
                color: "#FB7185"
            },
            {
                name: "Cumplimiento del plan de capacitación",
                target: 90,
                comparator: "≥",
                values: [72, 84, 91, 95],
                periods: ["T1", "T2", "T3", "T4"],
                frequency: "Trimestral",
                direction: "min",
                color: "#0D9488"
            },
            {
                name: "Simulacros realizados",
                target: 90,
                comparator: "≥",
                values: [80, 100],
                periods: ["S1", "S2"],
                frequency: "Semestral",
                direction: "min",
                color: "#0D9488"
            },
            {
                name: "Peligros intervenidos",
                target: 90,
                comparator: "≥",
                values: [55, 70, 85, 92],
                periods: ["T1", "T2", "T3", "T4"],
                frequency: "Trimestral",
                direction: "min",
                color: "#0D9488"
            }
        ];
        var sgsstCharts = {};

        function formatSgsstValue(value) {
            return Number(value).toLocaleString("es-CO", { maximumFractionDigits: 1 });
        }

        function getSgsstStatus(metric, value) {
            var met = metric.direction === "max" ? value <= metric.target : value >= metric.target;
            if (met) {
                return { className: "is-met", label: "Cumple la meta" };
            }

            var gap = metric.direction === "max"
                ? (value - metric.target) / metric.target
                : (metric.target - value) / metric.target;
            return gap <= 0.1
                ? { className: "is-near", label: "Cerca de la meta" }
                : { className: "is-missed", label: "No cumple la meta" };
        }

        function renderSgsstKpis() {
            var grid = document.getElementById("sgsstKpiGrid");
            if (!grid) {
                return;
            }

            sgsstMetrics.forEach(function (metric) {
                var latest = metric.values[metric.values.length - 1];
                var status = getSgsstStatus(metric, latest);
                var card = document.createElement("article");
                card.className = "sgsst-kpi-card " + status.className;

                var label = document.createElement("div");
                label.className = "sgsst-kpi-label";
                label.textContent = metric.name;

                var value = document.createElement("div");
                value.className = "sgsst-kpi-value";
                value.textContent = formatSgsstValue(latest) + "%";

                var meta = document.createElement("div");
                meta.className = "sgsst-kpi-meta";
                meta.textContent = "Meta: " + metric.comparator + " " + formatSgsstValue(metric.target) + "%";

                var period = document.createElement("div");
                period.className = "sgsst-kpi-period";
                period.textContent = "Último periodo: " + metric.periods[metric.periods.length - 1];

                var statusLabel = document.createElement("span");
                statusLabel.className = "sgsst-kpi-status";
                statusLabel.textContent = status.label;

                card.append(label, value, meta, period, statusLabel);
                grid.appendChild(card);
            });
        }

        function appendSgsstDataRow(tableBody, metric, period, value) {
            var row = document.createElement("tr");
            var cells = [
                metric.name,
                period,
                formatSgsstValue(value) + "%",
                metric.comparator + " " + formatSgsstValue(metric.target) + "%"
            ];
            cells.forEach(function (cellText) {
                var cell = document.createElement("td");
                cell.textContent = cellText;
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        }

        function renderSgsstDataTable() {
            var tableBody = document.getElementById("sgsstSimulationData");
            if (!tableBody) {
                return;
            }

            sgsstMetrics.forEach(function (metric) {
                metric.values.forEach(function (value, index) {
                    appendSgsstDataRow(tableBody, metric, metric.periods[index], value);
                });
            });
        }

        function sgsstTooltipLabel(context) {
            var value = context.parsed.y;
            if (value === null || typeof value === "undefined") {
                return "";
            }
            if (context.dataset.isGoal) {
                return "Meta: " + context.dataset.goalLabel;
            }
            return context.dataset.label + ": " + formatSgsstValue(value) + "% · Meta: " + context.dataset.goalLabel;
        }

        var emergencyStartMarker = {
            id: "sgsstEmergencyStartMarker",
            afterDraw: function (chart) {
                var chartArea = chart.chartArea;
                var xScale = chart.scales.x;
                if (!chartArea || !xScale || chart.data.labels.length < 4) {
                    return;
                }

                var markerX = xScale.getPixelForValue(3);
                var context = chart.ctx;
                var lines = ["Inicio del programa de controles", "de emergencia"];
                var boxWidth = Math.min(232, chartArea.right - chartArea.left - 8);
                var boxHeight = 32;
                var boxX = Math.max(
                    chartArea.left + 4,
                    Math.min(markerX - boxWidth / 2, chartArea.right - boxWidth - 4)
                );
                var boxY = chartArea.top + 5;

                context.save();
                context.strokeStyle = "#FB7185";
                context.lineWidth = 1.5;
                context.setLineDash([5, 4]);
                context.beginPath();
                context.moveTo(markerX, chartArea.top);
                context.lineTo(markerX, chartArea.bottom);
                context.stroke();
                context.setLineDash([]);

                context.fillStyle = "rgba(255,255,255,0.94)";
                context.fillRect(boxX, boxY, boxWidth, boxHeight);
                context.strokeStyle = "#FB7185";
                context.lineWidth = 1;
                context.strokeRect(boxX, boxY, boxWidth, boxHeight);
                context.fillStyle = "#9f354a";
                context.font = "9px sans-serif";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(lines[0], boxX + boxWidth / 2, boxY + 11, boxWidth - 8);
                context.fillText(lines[1], boxX + boxWidth / 2, boxY + 23, boxWidth - 8);
                context.restore();
            }
        };

        function createSgsstLineChart(canvasId, metric, suggestedMax) {
            var goalLabel = metric.comparator + " " + formatSgsstValue(metric.target) + "%";
            var chart = new Chart(document.getElementById(canvasId), {
                type: "line",
                data: {
                    labels: sgsstMonths,
                    datasets: [
                        {
                            label: metric.name,
                            data: metric.values,
                            borderColor: metric.color,
                            backgroundColor: metric.color,
                            borderWidth: 2.5,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            tension: 0.28,
                            goalLabel: goalLabel
                        },
                        {
                            label: "Meta " + goalLabel,
                            data: sgsstMonths.map(function () { return metric.target; }),
                            borderColor: "#6B7280",
                            borderWidth: 1.5,
                            borderDash: [6, 5],
                            pointRadius: 0,
                            tension: 0,
                            isGoal: true,
                            goalLabel: goalLabel
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
                        tooltip: {
                            callbacks: {
                                label: sgsstTooltipLabel,
                                afterBody: function () { return "Inicio del programa: abril"; }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Mes" },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            suggestedMax: suggestedMax,
                            title: { display: true, text: "Porcentaje (%)" },
                            ticks: { callback: function (value) { return formatSgsstValue(value) + "%"; } }
                        }
                    }
                },
                plugins: [emergencyStartMarker]
            });
            sgsstCharts[canvasId] = chart;
        }

        function createSgsstComplianceChart() {
            var labels = ["Capacitación", "Simulacros", "Peligros intervenidos"];
            var periods = [
                { label: "T1 / S1", values: [72, 80, 55], color: "rgba(13, 148, 136, 0.46)" },
                { label: "T2", values: [84, null, 70], color: "rgba(13, 148, 136, 0.64)" },
                { label: "T3 / S2", values: [91, 100, 85], color: "rgba(13, 148, 136, 0.82)" },
                { label: "T4", values: [95, null, 92], color: "#0D9488" }
            ];
            var datasets = periods.map(function (period) {
                return {
                    label: period.label,
                    data: period.values,
                    backgroundColor: period.color,
                    borderRadius: 5,
                    maxBarThickness: 26,
                    goalLabel: "≥ 90%"
                };
            });
            datasets.push({
                type: "line",
                label: "Meta ≥ 90%",
                data: labels.map(function () { return 90; }),
                borderColor: "#6B7280",
                borderWidth: 1.5,
                borderDash: [6, 5],
                pointRadius: 0,
                isGoal: true,
                goalLabel: "≥ 90%"
            });

            sgsstCharts.complianceChart = new Chart(document.getElementById("complianceChart"), {
                type: "bar",
                data: { labels: labels, datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
                        tooltip: { callbacks: { label: sgsstTooltipLabel } }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Indicador" },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            max: 110,
                            title: { display: true, text: "Cumplimiento (%)" },
                            ticks: { callback: function (value) { return value + "%"; } }
                        }
                    }
                }
            });
        }

        function initializeSgsstCharts() {
            var chartStatus = document.getElementById("sgsstChartStatus");
            if (!document.getElementById("sgsstKpiGrid")) {
                return;
            }

            renderSgsstKpis();
            renderSgsstDataTable();

            if (typeof Chart === "undefined") {
                chartStatus.textContent = "No se pudo cargar Chart.js. Comprueba la conexión a internet y vuelve a cargar la página para ver las gráficas.";
                chartStatus.hidden = false;
                var downloadButtons = document.querySelectorAll(".sgsst-chart-download");
                for (var i = 0; i < downloadButtons.length; i++) {
                    downloadButtons[i].disabled = true;
                }
                return;
            }

            createSgsstLineChart("accidentChart", sgsstMetrics[0], 1.5);
            createSgsstLineChart("absenceChart", sgsstMetrics[1], 5.5);
            createSgsstComplianceChart();

            var downloadButtons = document.querySelectorAll(".sgsst-chart-download");
            for (var j = 0; j < downloadButtons.length; j++) {
                downloadButtons[j].addEventListener("click", function () {
                    var chart = sgsstCharts[this.getAttribute("data-chart")];
                    if (!chart) {
                        throw new Error("No se encontró la gráfica solicitada para exportar.");
                    }
                    var downloadLink = document.createElement("a");
                    downloadLink.href = chart.toBase64Image("image/png", 1);
                    downloadLink.download = this.getAttribute("data-filename");
                    downloadLink.click();
                });
            }
        }

        initializeSgsstCharts();
