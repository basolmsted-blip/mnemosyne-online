---
layout: page
title: Sebastian Olmsted
permalink: /authors/sebastian-olmsted/
subtitle: Archaeologist, writer, and creator of Mnemosyne Archaeology.
seo_title: Sebastian Olmsted, Archaeologist and Writer
seo_description: "Sebastian Olmsted is an archaeologist and the writer and creator of Mnemosyne Archaeology."
---

Sebastian Olmsted is an archaeologist whose work centres on medieval landscapes, geographic information systems, and the interpretation of material evidence. He writes and illustrates Mnemosyne’s rigorously researched essays about archaeology, material culture, landscapes, and memory.

## Articles

{% assign author_posts = site.posts | where: "author", "Sebastian Olmsted" %}
{% for post in author_posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) — {{ post.excerpt_text | default: post.subtitle }}
{% endfor %}
