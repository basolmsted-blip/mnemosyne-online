# Mnemosyne Online

An illustrated public-archaeology publication built for GitHub Pages.

## Publish the site

1. Create a public GitHub repository named `mnemosyne-online`.
2. Upload the contents of this folder to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.
5. In `_config.yml`, set `url` to `https://YOUR-USERNAME.github.io`. The repository path is already configured.
6. Add the full Instagram profile URL to `instagram_url` when the account is ready.

## Publish a new article

1. Copy `_drafts/article-template.md` into `_posts`.
2. Rename it `YYYY-MM-DD-short-title.md`.
3. Complete the metadata at the top and replace the template prose.
4. Put article images in `assets/images/articles/short-title/`.
5. Commit the changes. The homepage and article archive update automatically.

To keep an article private while editing, leave it in `_drafts`. GitHub Pages does not publish that folder.

## Local preview

With Ruby and Bundler installed:

```sh
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000`.
