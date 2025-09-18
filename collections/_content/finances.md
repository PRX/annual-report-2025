---
title: "Finances"
link:
  anchor: "finances"
  label: "Finances"
---
<div class="financials">
  {% assign info_tiles = site.data.financials | where: 'type', 'revenue' %}
  {% if info_tiles %}
    {% include components/info-tiles.html heading="Revenue" class="financial-section" %}
  {% endif %}


  {% assign info_tiles = site.data.financials | where: 'type', 'expense' %}
  {% if info_tiles %}
    {% include components/info-tiles.html heading="Expenses" class="financial-section" %}
  {% endif %}
</div>
