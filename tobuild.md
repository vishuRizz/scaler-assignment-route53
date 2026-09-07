There are 3 categories:

🟢 FULLY IMPLEMENT
🟡 UI ONLY / PLACEHOLDER
⚪ DO NOT BUILD — visible in AWS but outside the assignment
🟢 1. FULLY IMPLEMENT — CORE ASSIGNMENT

These need real frontend + FastAPI + SQLite functionality.

A. Authentication
Login
Login page
Email/password or whatever mocked credentials you choose
Login API
Session creation
Logout
Logout button
Destroy session
Session persistence
Refresh browser → still logged in
Backend checks session
B. Hosted Zones

This is a complete feature.

Hosted Zones list

You need:

Page title: Hosted zones
Create hosted zone button
Search/filter
Table
Sorting
Pagination
Select a hosted zone
View details
Edit
Delete
Empty state
Notifications
Loading/error states
Hosted Zone table

Based on your screenshot, reproduce things like:

Hosted zone name
Type
Created by
Record count
Description
Hosted zone ID

You don't necessarily need every AWS column if the assignment doesn't require it, but matching the real UI is preferable.

C. Create Hosted Zone

Real functionality.

Something along the lines of:

Domain name
Description / Comment
Type
  ○ Public hosted zone
  ○ Private hosted zone

Then:

Create
Cancel

Data goes into SQLite.

D. Hosted Zone Details

When you click:

example.com

you need the actual zone management page.

It should show:

Hosted zone
example.com

Records

and the DNS records belonging to that zone.

E. Edit Hosted Zone

Real functionality.

You need to allow whatever editable fields your implementation exposes, such as:

Description

Then save to SQLite.

F. Delete Hosted Zone

Real functionality.

Should have:

Delete hosted zone?

Are you sure?

[Cancel] [Delete]

And delete it from SQLite.

Its records should also be removed.

🟢 2. DNS RECORDS — FULLY IMPLEMENT

This is probably the second major feature.

Inside a hosted zone:

Hosted zones
    ↓
example.com
    ↓
Records
Records page

Need:

Records table
Search
Filters
Pagination
Create record
Edit record
Delete record
Notifications
Empty state
Loading/error states
Supported record types

You must support:

A
AAAA
CNAME
TXT
MX
NS
PTR
SRV
CAA

These should actually be stored in SQLite.

🟢 3. Create/Edit DNS Record

This is also real functionality.

The form needs to adapt based on record type.

For example:

A
Record name
Type: A
TTL
Value
MX
Record name
Type: MX
TTL
Priority
Value
SRV
Record name
Type: SRV
TTL
Priority
Weight
Port
Value

etc.

You don't need to implement actual DNS behavior.

You're just storing/managing the configuration.

🟢 4. Search / Filters / Pagination

These are not placeholders.

The assignment explicitly asks for them.

Hosted Zones
Search
Pagination
Sorting/filtering
Records
Search
Filters
Pagination

Ideally the frontend sends these to FastAPI rather than downloading everything and filtering locally.

🟢 5. Notifications / Modals

Also real UX.

Examples:

Hosted zone created successfully

Record updated successfully

Record deleted successfully

And confirmation modals for destructive operations.

🟡 6. PLACEHOLDER SECTIONS

The assignment explicitly gives you permission to make these Coming Soon.

Dashboard
Dashboard

Coming Soon

No real AWS dashboard functionality.

Traffic Policies
Traffic policies

Coming Soon
Health Checks
Health checks

Coming Soon
Resolver
Resolver

Coming Soon

This includes the Resolver area visible in your AWS sidebar.

Profiles
Profiles

Coming Soon
⚪ 7. DON'T BUILD THESE

This is where your screenshot is confusing because AWS has WAY more stuff than your assignment requires.

Your screenshot contains:

Global Resolver
VPC Resolver
Domains
IP-based routing
Traffic flow
...

You do not need to implement those.

For example:

Global Resolver
Global resolvers
Shared DNS views

❌ Not required.

VPC Resolver
VPCs
Inbound endpoints
Outbound endpoints
Rules
Query logging
Outposts

❌ Not required.

Domains
Registered domains
Requests

❌ Not required.

IP-based routing
CIDR collections

❌ Not required.

Traffic Flow extras

Anything beyond the explicitly mentioned Traffic Policies placeholder:

❌ Not required.

🟡 But what about the sidebar?

Here's where I'd make a distinction.

You don't need to reproduce every AWS sidebar item.

I'd make your sidebar look like Route 53 but only include the relevant assignment areas:

Route 53

Dashboard

Hosted zones

Health checks
Profiles

Resolver

Traffic policies

You could add the additional AWS sections as disabled/placeholder navigation if you want visual similarity, but don't waste development time implementing them.

🟢 8. Backend

Your FastAPI backend needs real endpoints for:

Auth
POST /auth/login
POST /auth/logout
GET  /auth/me
Hosted zones
GET    /hosted-zones
POST   /hosted-zones
GET    /hosted-zones/{id}
PUT    /hosted-zones/{id}
DELETE /hosted-zones/{id}
Records
GET    /hosted-zones/{zone_id}/records
POST   /hosted-zones/{zone_id}/records

GET    /records/{id}
PUT    /records/{id}
DELETE /records/{id}

SQLite persists everything.

🟢 9. Database

At minimum:

users
    ↓
hosted_zones
    ↓
dns_records

Relationship:

User
 │
 └── Hosted Zones
        │
        ├── Record
        ├── Record
        ├── Record
        └── Record
🟢 10. README

Required:

Setup instructions
Architecture
Database schema
API overview

Don't forget this — it's explicitly part of the deliverables.

🟢 11. Deployment

You need:

Frontend → hosted
Backend  → hosted
Database → persistent

and a working demo URL.

🟣 12. OPTIONAL BONUS

Only after everything above works:

BIND import
BIND export
JSON export
Dark mode
Keyboard shortcuts
Bulk operations
The whole assignment reduced to one diagram
                    ROUTE 53 CLONE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Authentication   Hosted Zones      Navigation
        │                │                │
     🟢 Real          🟢 Real          🟡 Some real
        │                │              🟡 placeholders
        │                │
        │         ┌──────┴──────┐
        │         │             │
        │       CRUD          Search
        │         │             │
        │      SQLite       Pagination
        │
        │
        └─────────────────────────────┐
                                      │
                                DNS Records
                                      │
                                  🟢 Real
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                           CRUD              Search
                            │                   │
                         SQLite             Filters
                                                │
                                           Pagination
And the most important distinction:

You are NOT cloning AWS.

You are cloning the Route 53 product experience relevant to the assignment.

So your MVP is essentially:

Login → Route 53 shell → Hosted Zones → Create/Edit/Delete zones → Open zone → Manage DNS records → Search/filter/paginate → persistent SQLite.

Everything else is either Coming Soon or out of scope.