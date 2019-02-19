(function(window, document, undefined) {
    function highlight_line(state, ctx, text, x, y, default_font) {
        // if it's the start or end of a multiline string, update the state and render it out
        let started_in_multi_line_string = state.in_multi_line_string;
        if ((text.match(/"""/g) || []).length % 2 == 1) {
            state.in_multi_line_string = !state.in_multi_line_string;
            if (state.in_multi_line_string) {
                ctx.fillStyle = "#d14";
            }
        }
        if (state.line_wrap) {
            // don't update the style
            state.line_wrap = false;
            ctx.fillText(text, x, y);
        } else if (state.in_multi_line_string || started_in_multi_line_string) {
            ctx.fillText(text, x, y);
        } else {
            // create a temporary fragment to highlight
            let frag = document.createElement("div");
            frag.style.display = "none";
            document.body.appendChild(frag);
            
            frag.innerHTML = text;
            hljs.highlightBlock(frag);
            let text_width = 0;
            for (let child of Array.from(frag.childNodes)) {
                if (child.nodeType == Node.TEXT_NODE) {
                    ctx.fillStyle = "#333"; // default color
                } else {
                    let child_style = window.getComputedStyle(child);
                    ctx.fillStyle = child_style.getPropertyValue("color");
                }
                ctx.fillText(child.textContent, x + text_width, y);
                text_width += ctx.measureText(child.textContent).width;
            }
            // *sobs*
            frag.parentNode.removeChild(frag);
        }
        
        // update state.line_wrap
        if (text.endsWith(" ")) {
            state.line_wrap = true;
        }
        return state;
    }
    function highlight_page(page, canvas, state) {
        let c = canvas;
        let ctx = c.getContext("2d");
        let source_text_container = page.querySelector(".TextLayer-container");
        let source_text_lines = Array.from(source_text_container.querySelectorAll(".textLayer--absolute"));

        let font_size = window.devicePixelRatio * parseFloat(window.getComputedStyle(source_text_lines[0]).fontSize);
        let default_font = `${font_size}px monospace`;

        // clearing and general setup
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,c.width,c.height);
        ctx.font = default_font
        ctx.textBaseline = "top";
        
        for (let source_text_line of source_text_lines) {
            let x = parseFloat(source_text_line.style.left) * window.devicePixelRatio;
            let y = parseFloat(source_text_line.style.top) * window.devicePixelRatio;
            let text = source_text_line.textContent;
            state = highlight_line(state, ctx, text, x, y, default_font);
        }
        return state;
    }
    function highlight_all() {
        // *sobs*
        if (!document.querySelector(".TextLayer-container").textContent.includes("import ")) {
            console.log("Probably not a python file, ignoring");
            return;
        }
        let pages = Array.from(document.querySelectorAll(".Page-container"));
        let state = {};
        var highlight_checker = window.setInterval(() => {
            let page_count = 0;
            for (let page of pages) {
                if (!page.is_highlighted) {
                    let c = page.querySelector("canvas");
                    if (c) {
                        state = highlight_page(page, c, state);
                        page.is_highlighted = true;
                    } else {
                        // we're out of canvases to highlight
                        // console.log("Checked highlights but stopped highlighting after page", page_count);
                        return;
                    }
                }
                page_count += 1;
            }
            console.log("Done highlighting!");
            // they're all highlighted, stop eating cpu
            window.clearInterval(highlight_checker);
        }, 1000);
    }
    window.setTimeout(highlight_all, 1500);
})(this, this.document);