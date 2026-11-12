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
                sections: []
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
