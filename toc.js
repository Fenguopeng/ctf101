// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="encodings/index.html"><strong aria-hidden="true">1.</strong> 编码</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="encodings/base.html"><strong aria-hidden="true">1.1.</strong> Base编码</a></li></ol></li><li class="chapter-item expanded "><a href="stego/index.html"><strong aria-hidden="true">2.</strong> 隐写术</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="stego/image.html"><strong aria-hidden="true">2.1.</strong> 图像隐写</a></li><li class="chapter-item expanded "><a href="stego/audio.html"><strong aria-hidden="true">2.2.</strong> 音频隐写</a></li><li class="chapter-item expanded "><a href="stego/video.html"><strong aria-hidden="true">2.3.</strong> 视频隐写</a></li><li class="chapter-item expanded "><a href="stego/document.html"><strong aria-hidden="true">2.4.</strong> 文档隐写</a></li></ol></li><li class="chapter-item expanded "><a href="web/index.html"><strong aria-hidden="true">3.</strong> Web安全</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="web/php.html"><strong aria-hidden="true">3.1.</strong> PHP 语法</a></li><li class="chapter-item expanded "><a href="web/php-tricks.html"><strong aria-hidden="true">3.2.</strong> PHP 特性</a></li><li class="chapter-item expanded "><a href="web/leak.html"><strong aria-hidden="true">3.3.</strong> 信息泄露</a></li><li class="chapter-item expanded "><a href="web/directory-traversal.html"><strong aria-hidden="true">3.4.</strong> 目录遍历</a></li><li class="chapter-item expanded "><a href="web/command-injection.html"><strong aria-hidden="true">3.5.</strong> 命令注入漏洞</a></li><li class="chapter-item expanded "><a href="web/code-injection.html"><strong aria-hidden="true">3.6.</strong> 代码注入漏洞</a></li><li class="chapter-item expanded "><a href="web/file-upload.html"><strong aria-hidden="true">3.7.</strong> 文件上传漏洞</a></li><li class="chapter-item expanded "><a href="web/php-file-inclusion.html"><strong aria-hidden="true">3.8.</strong> PHP 文件包含漏洞</a></li><li class="chapter-item expanded "><a href="web/xss.html"><strong aria-hidden="true">3.9.</strong> 跨站脚本攻击</a></li><li class="chapter-item expanded "><a href="web/csrf.html"><strong aria-hidden="true">3.10.</strong> 跨站请求伪造</a></li><li class="chapter-item expanded "><a href="web/ssrf.html"><strong aria-hidden="true">3.11.</strong> 服务端请求伪造</a></li><li class="chapter-item expanded "><a href="web/sqli.html"><strong aria-hidden="true">3.12.</strong> SQL 注入漏洞</a></li><li class="chapter-item expanded "><a href="web/PHP.html"><strong aria-hidden="true">3.13.</strong> PHP 反序列化漏洞</a></li><li class="chapter-item expanded "><a href="web/xxe.html"><strong aria-hidden="true">3.14.</strong> XML外部实体注入漏洞</a></li><li class="chapter-item expanded "><a href="web/jwt.html"><strong aria-hidden="true">3.15.</strong> JWT</a></li><li class="chapter-item expanded "><a href="web/ssti.html"><strong aria-hidden="true">3.16.</strong> 服务端模板注入漏洞</a></li></ol></li><li class="chapter-item expanded "><a href="forensic/index.html"><strong aria-hidden="true">4.</strong> 取证</a></li><li><ol class="section"><li class="chapter-item expanded "><div><strong aria-hidden="true">4.1.</strong> 压缩包分析</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">4.2.</strong> 流量分析</div></li><li class="chapter-item expanded "><a href="forensic/log.html"><strong aria-hidden="true">4.3.</strong> 日志分析</a></li><li class="chapter-item expanded "><div><strong aria-hidden="true">4.4.</strong> 磁盘取证</div></li><li class="chapter-item expanded "><a href="forensic/memory.html"><strong aria-hidden="true">4.5.</strong> 内存取证</a></li></ol></li><li class="chapter-item expanded "><a href="crypto/index.html"><strong aria-hidden="true">5.</strong> 密码学</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="crypto/classical.html"><strong aria-hidden="true">5.1.</strong> 古典密码</a></li><li class="chapter-item expanded "><a href="crypto/RSA.html"><strong aria-hidden="true">5.2.</strong> RSA</a></li></ol></li><li class="chapter-item expanded "><a href="reverse/index.html"><strong aria-hidden="true">6.</strong> 逆向工程</a></li><li class="chapter-item expanded "><div><strong aria-hidden="true">7.</strong> Pwn</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">8.</strong> 移动安全</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">9.</strong> 工控安全</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">10.</strong> AI安全</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">11.</strong> 车联网安全</div></li><li class="chapter-item expanded "><div><strong aria-hidden="true">12.</strong> 区块链安全</div></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
