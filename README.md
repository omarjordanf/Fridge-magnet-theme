# Chicago7 for Micro.blog — Cole Derochie-inspired edition

This Micro.blog adaptation keeps Chicago7's Hugo support while reworking its presentation around a clean white canvas and colorful letter magnets. The homepage always spells **Lots of Love**; your site name sits in the top-left corner. The letters appear in changing colors, mixed type styles, and loose random positions on each visit. Drag letters into one another to make them bump without overlapping; focus one and use the arrow keys for precise movement. Escape resets the letters. The letters tumble away briefly when you follow a link from the homepage.

The stylesheet is plain static CSS. Publishing requires no Sass compiler, Hugo Pipes, modules, or JavaScript build step. A small script powers the homepage letter movement and navigation transition. If JavaScript is unavailable, “Lots of Love” remains visible as a static wordmark.

## Install on Micro.blog

1. In Micro.blog, open **Posts → Design → Edit Custom Themes → New Theme**.
2. Import this theme from its GitHub repository. If your theme editor offers ZIP upload, you can use the included ZIP; its files are at the archive root.
3. Save the theme, then select it on **Posts → Design** and preview your site.

Micro.blog's documented custom-theme import clones a GitHub repository. If ZIP upload is not available in your account, unzip the package, upload its contents to a GitHub repository, and use that repository's URL as the Clone URL.

## Navigation and personalization

The header includes a Writing link, RSS, and every item in your Micro.blog `main` menu. Add pages such as About to that menu so readers can reach them from every page. Where your Micro.blog configuration exposes Hugo parameters, these values personalize the design:

- `title`: your name or site name, shown in the top-left header.
- `params.role`: the quiet caption in the bottom-left corner.
- `params.author`, `params.description`: optional author and site description.

Posts and pages open as regular pages with a calm, narrow reading column, generous spacing, and small playful color accents. They retain normal Hugo URLs and layouts. The theme supports `main` navigation, RSS, categories, tags, archives, and pagination.

The design uses a locally installed rounded system font where available and loads Nunito as a fallback. The layout does not require images or icon files.

## Local compatibility

The theme was built and checked locally with Hugo 0.91, 0.117, and 0.158. Select the Hugo version available in your Micro.blog Design settings.

## Credits and license

Adapted from [Chicago7](https://github.com/akopdev/hugo-theme-chicago7) by akopdev (MIT license). The visual direction is inspired by [Cole Derochie's site](https://colederochie.com/); this is an independent recreation, not a copy of its source code.
