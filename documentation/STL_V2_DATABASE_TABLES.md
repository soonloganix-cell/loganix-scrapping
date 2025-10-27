# STL V2 Database Tables Documentation

## Table Relationships

All tables (except `stl_v2_sites_staging`) reference the main sites table through the `site_id` foreign key with `ON DELETE CASCADE`, ensuring data integrity. The schema follows a star pattern with `stl_v2_sites_staging` at the center and related tables extending outward to provide specialized information about each site.

**Core Table:** `stl_v2_sites_staging` (site_id as primary key)

**Direct Relationships:**
- One-to-One: `stl_v2_details_staging`
- One-to-Many: `stl_v2_geo_staging`, `stl_v2_tags_staging`, `stl_v2_topics_staging`, `stl_v2_traffic_trend_staging`, `stl_v2_vendor_sites_staging`, `stl_v2_ai_category_staging`, `stl_v2_publisher_sites_staging`

---

## 1. stl_v2_sites_staging

**Description:**

This is the primary table that stores the core inventory of all publisher websites in the system. It contains essential SEO metrics (DA, DR, TF, CF), traffic data, pricing information, and various quality indicators for each domain. The table serves as the central hub that all other tables reference through the `site_id` foreign key.

Each record represents a unique domain with comprehensive metadata including link types (dofollow/nofollow/sponsored), turnaround times, geographic location, language preferences, and quality scores such as UX score, link fraud detection, and link durability. The table also includes AI-generated insights, traffic trends, and special certifications like "Loganix Certified" status.

**Example:**
```
site_id: 2
domain: example.com
is_direct: TRUE
da: 45, dr: 52, tf: 35, cf: 40
traffic_total: 15000
starting_at: 129.00
link_type: dofollow
tat: 3 weeks
spoken_language: en
loganix_certified: TRUE
```

---

## 2. stl_v2_details_staging

**Description:**

This table stores additional operational and performance details for each site that don't fit into the main sites table. It focuses on publisher reliability metrics and internal documentation that helps manage relationships with publishers and set client expectations.

Key information includes the average publisher delay (how long it typically takes for content to go live), approval rates for submitted content, content guidelines that publishers require, and internal notes for team reference. This table is essential for operational planning and managing client expectations around delivery timelines and content requirements.

**Example:**
```
site_id: 2
avg_publisher_delay: 21.0 (days)
approval_rate: 95.50 (percentage)
guidelines: "500+ words, natural anchor text, no grey niches"
notes_internal: "Publisher prefers topics about lifestyle and business"
```

---

## 3. stl_v2_geo_staging

**Description:**

This table tracks the geographic distribution of traffic for each website. It stores country-specific traffic data with rankings, allowing the system to understand which countries generate the most visitors for each domain. This information is crucial for clients who need to target specific geographic markets.

**Example:**

| site_id | country_code | traffic | rank |
|---------|--------------|---------|------|
| 2       | US           | 5400    | 1    |
| 2       | GB           | 2475    | 2    |
| 2       | CA           | 540     | 3    |

---

## 4. stl_v2_publisher_sites_staging

**Description:**

This table contains detailed information about direct publisher relationships, as opposed to marketplace vendors. It stores comprehensive pricing structures for different content types (general, adult, gambling, crypto, payday) and distinguishes between new posts and link edits. The table also tracks various publisher requirements and capabilities.

**Example:**
```
site_id: 2
website: example.com/blog
publisher: editor@example.com
tat: 7 (days)
link_type: dofollow
price_general: 125.00
price_crypto: 150.00
price_general_edits: 75.00
youtube_embed: TRUE
word_count_minimum: 500
permanent_link: TRUE
indexed: TRUE
```

---

## 5. stl_v2_tags_staging

**Description:**

This table stores system-generated or employee-assigned tags that categorize sites based on various attributes and characteristics. Tags provide quick, scannable metadata that helps users filter and identify sites with specific qualities. Unlike formal categories, tags are more flexible and can represent operational attributes, quality indicators, or special features.

**Example:**

| site_id | tag           |
|---------|---------------|
| 2       | Fast          |
| 2       | Premium       |
| 2       | High Traffic  |

---

## 6. stl_v2_topics_staging

**Description:**

This table stores specific topic areas or subject matters that each website covers. Topics are more granular than broad categories and represent the actual content themes that a site publishes about. This helps match client content with topically relevant publishers, which is crucial for maintaining editorial quality and link relevance.

**Example:**

| site_id | topic                    |
|---------|--------------------------|
| 2       | Personal Finance         |
| 2       | Investment Strategies    |
| 2       | Retirement Planning      |

---

## 7. stl_v2_traffic_trend_staging

**Description:**

This table functions as a time-series database that tracks historical traffic values for each website over time. It allows the system to analyze traffic patterns, identify growing or declining sites, and provide clients with confidence about a site's traffic stability. Each record represents a single data point in the traffic history.

**OBS:** Only one record per site is allowed.

**Example:**

| site_id | date       | traffic_value |
|---------|------------|---------------|
| 2       | 2025-10-01 | 15000         |

---

## 8. stl_v2_vendor_sites_staging

**Description:**

This table manages relationships with marketplace vendors who provide access to publisher sites. Unlike direct publisher relationships, vendor relationships involve third-party platforms (like HARO, Terkel, or other link marketplaces) that aggregate multiple publishers. This table tracks which vendors offer which sites and at what cost.

**Example:**
```
site_id: 2
vendor: marketplace_a
type: Guest Post
source_table: gp_vendors
cost: 145.00
tat: 14 (days)
link_type: dofollow
is_minimum_cost: TRUE
```

---

## 9. stl_v2_ai_category_staging

**Description:**

This table stores AI-generated and manually curated category classifications for each website. Categories represent broad topical areas that help organize and filter the site inventory. A single site can belong to multiple categories, reflecting the diverse content areas it covers. This flexible many-to-many relationship allows for nuanced classification.

**Example:**

| site_id | category      |
|---------|---------------|
| 2       | Technology    |
| 2       | Business      |
| 2       | Innovation    |

---