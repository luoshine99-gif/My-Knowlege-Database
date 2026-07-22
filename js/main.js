(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Yuque Pro: JS Loaded");
    const themeCheckbox = document.getElementById("checkbox");
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    if (currentTheme === "dark" && themeCheckbox) {
      themeCheckbox.checked = true;
    }
    if (themeCheckbox) {
      themeCheckbox.addEventListener("change", () => {
        const newTheme = themeCheckbox.checked ? "dark" : "light";
        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        console.log("Theme changed to:", newTheme);
      });
    }
    document.addEventListener("click", (e) => {
      if (e.treeToggleHandled) return;
      const toggleBtn = e.target.closest(".tree-toggle");
      const sectionLink = e.target.closest(".section-link");
      const trigger = toggleBtn || sectionLink;
      if (!trigger) return;
      console.log("Tree toggle triggered by:", trigger);
      const li = trigger.closest("li");
      if (!li) {
        console.log("No parent li found");
        return;
      }
      e.treeToggleHandled = true;
      let children = null;
      let toggleIcon = null;
      for (let i = 0; i < li.children.length; i++) {
        const child = li.children[i];
        if (child.classList.contains("tree-children")) {
          children = child;
        }
        if (child.classList.contains("tree-toggle")) {
          toggleIcon = child;
        }
      }
      if (!children || !toggleIcon) {
        console.log("Missing children or toggleIcon (direct check)", { children, toggleIcon });
        if (!children) {
          const found = li.querySelector(".tree-children");
          if (found && found.parentElement === li) children = found;
        }
        if (!toggleIcon) {
          const found = li.querySelector(".tree-toggle");
          if (found && found.parentElement === li) toggleIcon = found;
        }
        if (!children || !toggleIcon) {
          console.log("Still missing children or toggleIcon after fallback");
          return;
        }
      }
      console.log("Toggling tree section");
      e.preventDefault();
      e.stopPropagation();
      if (children.classList.contains("hidden")) {
        console.log("Opening section");
        children.classList.remove("hidden");
        children.style.display = "block";
        toggleIcon.classList.remove("collapsed");
        toggleIcon.classList.add("expanded");
      } else {
        console.log("Closing section");
        children.classList.add("hidden");
        children.style.display = "none";
        toggleIcon.classList.remove("expanded");
        toggleIcon.classList.add("collapsed");
      }
    });
    const currentUrl = window.location.pathname;
    console.log("Current URL:", currentUrl);
    const links = document.querySelectorAll(".tree a");
    links.forEach((link) => {
      const linkHref = link.getAttribute("href");
      if (linkHref && (linkHref === currentUrl || linkHref.replace(/\/$/, "") === currentUrl.replace(/\/$/, ""))) {
        link.style.fontWeight = "bold";
        link.style.color = "var(--link-color)";
        let parent = link.closest(".tree-children");
        while (parent) {
          parent.classList.remove("hidden");
          parent.style.display = "block";
          const toggle = parent.parentElement.querySelector(".tree-toggle");
          if (toggle) {
            toggle.classList.remove("collapsed");
            toggle.classList.add("expanded");
          }
          parent = parent.parentElement.closest(".tree-children");
        }
      }
    });
    const tooltip = document.createElement("div");
    tooltip.className = "preview-tooltip";
    document.body.appendChild(tooltip);
    let hoverTimeout;
    const articleLinks = document.querySelectorAll(".homepage-tree .article-link");
    articleLinks.forEach((link) => {
      link.addEventListener("mouseenter", (e) => {
        if (window.innerWidth <= 768) return;
        const summary = link.getAttribute("data-summary");
        if (!summary) return;
        const initialX = e.clientX;
        const initialY = e.clientY;
        hoverTimeout = setTimeout(() => {
          const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + "..." : summary;
          tooltip.textContent = truncatedSummary;
          tooltip.style.display = "block";
          let left = initialX + 15;
          let top = initialY + 15;
          const tooltipWidth = 500;
          if (left + tooltipWidth > window.innerWidth) {
            left = initialX - tooltipWidth - 15;
          }
          if (top + 150 > window.innerHeight) {
            top = initialY - 140;
          }
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
          tooltip.style.position = "fixed";
        }, 500);
      });
      link.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        tooltip.style.display = "none";
      });
    });
    const codeBlocks = document.querySelectorAll("pre");
    codeBlocks.forEach((block) => {
      if (block.closest(".code-wrapper")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper";
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        const code = block.querySelector("code");
        const text = code ? code.innerText : block.innerText;
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = "Copied!";
          setTimeout(() => {
            copyBtn.textContent = "Copy";
          }, 2e3);
        }).catch((err) => {
          console.error("Failed to copy:", err);
          copyBtn.textContent = "Error";
        });
      });
      wrapper.appendChild(copyBtn);
    });
    const article = document.querySelector(".markdown-body");
    if (article) {
      const templateTitle = document.querySelector(".post-title-template");
      const postDate = document.querySelector(".post-date");
      const firstH1 = article.querySelector("h1");
      if (firstH1) {
        if (templateTitle) {
          templateTitle.style.display = "none";
        }
        if (postDate) {
          firstH1.after(postDate);
        }
      }
    }
    const tocLinks = document.querySelectorAll("#TableOfContents a");
    const headers = Array.from(tocLinks).map((link) => {
      const id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    }).filter((header) => header !== null);
    if (headers.length > 0) {
      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tocLinks.forEach((link) => link.classList.remove("active"));
            const id = entry.target.id;
            const activeLink = document.querySelector(`#TableOfContents a[href="#${id}"]`);
            if (activeLink) {
              activeLink.classList.add("active");
              const sidebar = document.querySelector(".sidebar-right");
              if (sidebar) {
                const linkRect = activeLink.getBoundingClientRect();
                const sidebarRect = sidebar.getBoundingClientRect();
                const relativeTop = linkRect.top - sidebarRect.top;
                const relativeBottom = linkRect.bottom - sidebarRect.top;
                if (relativeTop < 0 || relativeBottom > sidebar.clientHeight) {
                  sidebar.scrollTo({
                    top: activeLink.offsetTop - sidebar.clientHeight / 2 + activeLink.clientHeight / 2,
                    behavior: "smooth"
                  });
                }
              }
            }
          }
        });
      };
      const observerOptions = {
        root: null,
        // Adjust rootMargin to trigger when header is near top of viewport
        // -100px from top means it triggers when it passes that line
        rootMargin: "0px 0px -80% 0px",
        threshold: 0
      };
      const observer = new IntersectionObserver(observerCallback, observerOptions);
      headers.forEach((header) => observer.observe(header));
    }
    const searchTrigger = document.getElementById("search-trigger");
    const searchModal = document.getElementById("search-modal");
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const searchLoading = document.querySelector(".search-loading");
    let searchIndex = null;
    let selectedIndex = -1;
    const openSearch = (e) => {
      const modalContent = document.querySelector(".search-modal-content");
      if (e && e.type === "click" && e.currentTarget) {
        const triggerRect = e.currentTarget.getBoundingClientRect();
        const triggerX = triggerRect.left + triggerRect.width / 2;
        const triggerY = triggerRect.top + triggerRect.height / 2;
        const windowWidth = window.innerWidth;
        const modalWidth = Math.min(600, windowWidth * 0.9);
        const modalLeft = (windowWidth - modalWidth) / 2;
        const modalTop = window.innerHeight * 0.15;
        const originX = triggerX - modalLeft;
        const originY = triggerY - modalTop;
        modalContent.style.transformOrigin = `${originX}px ${originY}px`;
      } else {
        modalContent.style.transformOrigin = "center top";
      }
      searchModal.classList.add("open");
      searchInput.focus();
      if (!searchIndex) {
        loadSearchIndex();
      }
    };
    const closeSearch = () => {
      searchModal.classList.add("closing");
      searchModal.classList.remove("open");
      setTimeout(() => {
        searchModal.classList.remove("closing");
        searchInput.value = "";
        searchResults.innerHTML = "";
        selectedIndex = -1;
      }, 200);
    };
    if (searchTrigger) {
      searchTrigger.addEventListener("click", openSearch);
    }
    const mobileSearchTrigger = document.getElementById("mobile-search-trigger");
    if (mobileSearchTrigger) {
      mobileSearchTrigger.addEventListener("click", openSearch);
    }
    const mobileExitBtn = document.getElementById("mobile-exit-btn");
    const mobileSearchBtn = document.getElementById("mobile-search-btn");
    if (mobileExitBtn) {
      mobileExitBtn.addEventListener("click", closeSearch);
    }
    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener("click", () => {
        const event = new Event("input", { bubbles: true });
        searchInput.dispatchEvent(event);
        searchInput.blur();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchModal.classList.contains("open")) {
        closeSearch();
      }
    });
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) {
        closeSearch();
      }
    });
    const loadSearchIndex = async () => {
      searchLoading.style.display = "block";
      try {
        const response = await fetch("/index.json?t=" + (/* @__PURE__ */ new Date()).getTime());
        searchIndex = await response.json();
        console.log("Search index loaded, items:", searchIndex ? searchIndex.length : 0);
      } catch (error) {
        console.error("Failed to load search index:", error);
        searchResults.innerHTML = '<div style="padding:20px;text-align:center;">Failed to load search index.</div>';
      } finally {
        searchLoading.style.display = "none";
      }
    };
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        searchResults.innerHTML = "";
        selectedIndex = -1;
        return;
      }
      if (!searchIndex) return;
      const results = searchIndex.filter((item) => {
        const titleMatch = item.title && item.title.toLowerCase().includes(query);
        const contentMatch = item.content && item.content.toLowerCase().includes(query);
        return titleMatch || contentMatch;
      }).slice(0, 50);
      renderResults(results);
    });
    const renderResults = (results) => {
      if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-color);opacity:0.6;">No results found.</div>';
        return;
      }
      let html2 = "";
      results.forEach((item, index) => {
        html2 += `
        <div class="search-result-item" data-index="${index}" onclick="window.location.href='${item.link}'">
          <span class="search-result-title">${item.title}</span>
          <span class="search-result-excerpt">${item.summary || "No summary available."}</span>
        </div>
      `;
      });
      searchResults.innerHTML = html2;
      selectedIndex = -1;
    };
    searchInput.addEventListener("keydown", (e) => {
      const items = document.querySelectorAll(".search-result-item");
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelection(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelection(items);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) {
          items[selectedIndex].click();
        } else if (items.length > 0) {
          items[0].click();
        }
      }
    });
    const updateSelection = (items) => {
      items.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("selected");
          item.scrollIntoView({ block: "nearest" });
        } else {
          item.classList.remove("selected");
        }
      });
    };
  });
})();
