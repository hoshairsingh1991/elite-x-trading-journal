# ============================================================
# ELITE X TRADING OS
# MASTER NOTES
# Production Email Infrastructure + Custom Domain Setup
# Date: July 17-18, 2026
# ============================================================

## Objective

The goal of this milestone was to replace Supabase's built-in email service with a production-grade email system using our own custom domain.

We wanted to accomplish the following:

- Professional branded authentication emails
- Password reset emails
- Email verification emails
- Future invite emails
- Future notification emails
- Production-ready SMTP
- Custom domain
- Proper email authentication (SPF, DKIM, DMARC)
- Root domain redirect to WWW
- Enterprise-grade authentication infrastructure

At the end of this milestone, all authentication emails are now sent through our own domain instead of Supabase.

------------------------------------------------------------

# Final Architecture

User

↓

Elite X Trading

↓

Supabase Authentication

↓

Custom SMTP

↓

Resend

↓

Recipient Email

Important:

Supabase still handles:

- Authentication
- Users
- Password reset
- Sessions
- Verification links

Resend ONLY sends emails.

------------------------------------------------------------

# Services Used

Domain Registrar

GoDaddy

Hosting

Vercel

Database

Supabase

Authentication

Supabase Auth

SMTP Provider

Resend

------------------------------------------------------------

# Domain

Production Domain

https://www.elitextrading.ca

Root Domain

https://elitextrading.ca

------------------------------------------------------------

# Why We Chose Resend

Reasons:

- Modern transactional email provider
- Excellent deliverability
- Simple setup
- Easy SMTP integration
- Recommended by many SaaS companies
- Works perfectly with Supabase SMTP

------------------------------------------------------------

# Resend Setup

Created Resend account.

Added domain:

elitextrading.ca

Resend generated DNS records that had to be added inside GoDaddy.

------------------------------------------------------------

# DNS Records Added

## Existing Records

NS

SOA

WWW CNAME

------------------------------------------------------------

## Added For Resend

### DKIM

Type

TXT

Host

resend._domainkey

Purpose

Digitally signs every email.

Improves trust.

Required for email authentication.

------------------------------------------------------------

### SPF

Type

TXT

Host

send

Value

v=spf1 include:amazonses.com ~all

Purpose

Allows Amazon SES (used by Resend) to send email.

------------------------------------------------------------

### MX

Type

MX

Host

send

Points To

feedback-smtp.us-east-1.amazonses.com

Priority

10

Purpose

Bounce handling.

------------------------------------------------------------

### DMARC

Type

TXT

Host

_dmarc

Value

v=DMARC1; p=none;

Purpose

Email authentication reporting.

Future

Can change to

p=quarantine

or

p=reject

once fully deployed.

------------------------------------------------------------

# Resend Verification

After DNS propagation

Status

Verified

Meaning

Our domain is now trusted.

Emails can now be sent professionally.

------------------------------------------------------------

# Resend Free Plan

Monthly

3000 emails

Daily

100 emails

More than enough for Elite X Trading V1.

------------------------------------------------------------

# Supabase SMTP Configuration

Inside

Authentication

↓

Emails

↓

SMTP

Enabled

Custom SMTP

------------------------------------------------------------

SMTP Settings

Sender Email

noreply@elitextrading.ca

Sender Name

Elite X Trading

SMTP Host

smtp.resend.com

Port

465

Username

resend

Password

Resend API Key

Minimum Interval

60 seconds

------------------------------------------------------------

# Result

Supabase no longer sends emails itself.

Every authentication email now goes through Resend.

------------------------------------------------------------

# Email Sender

Before

Supabase

After

Elite X Trading

<noreply@elitextrading.ca>

Professional branding achieved.

------------------------------------------------------------

# Authentication Emails Tested

Password Reset

PASS

Confirmation Email

PASS

Authentication Emails

PASS

------------------------------------------------------------

# Password Reset Testing

Initially

Clicking reset link opened Dashboard.

At first this looked like an SMTP issue.

It was NOT.

Reason

SMTP only delivers email.

Routing inside the application determines where the reset link goes.

After correcting the domain configuration and routing, the password reset flow worked correctly.

Lesson

Never troubleshoot routing from SMTP.

SMTP only sends emails.

------------------------------------------------------------

# Production Domain Setup

Primary Domain

www.elitextrading.ca

------------------------------------------------------------

Originally

elitextrading.ca

showed

Invalid Configuration

inside Vercel.

Reason

Missing Apex A Record.

------------------------------------------------------------

# Root Domain Fix

Added inside GoDaddy

Type

A

Host

@

Value

216.198.79.1

TTL

1 Hour

------------------------------------------------------------

After propagation

Vercel changed from

Invalid Configuration

↓

Valid Configuration

------------------------------------------------------------

# WWW Redirect

Decision

Use

www.elitextrading.ca

as the ONLY production URL.

Reasons

Single canonical URL

Better SEO

Avoid duplicate cookies

Cleaner authentication

Cleaner OAuth callbacks

Industry standard

Future CDN compatibility

------------------------------------------------------------

Configured inside Vercel

Root Domain

elitextrading.ca

↓

308 Permanent Redirect

↓

www.elitextrading.ca

------------------------------------------------------------

Final Result

Typing

https://elitextrading.ca

automatically redirects to

https://www.elitextrading.ca

------------------------------------------------------------

# Final Domain Status

www.elitextrading.ca

Valid

Production

------------------------------------------------------------

elitextrading.ca

Valid

308 Redirect

↓

www.elitextrading.ca

------------------------------------------------------------

elite-x-trading-journal.vercel.app

Valid

Production Alias

------------------------------------------------------------

# Email Security

Configured

SPF

DKIM

DMARC

Custom SMTP

HTTPS

Professional Sender

Custom Domain

Root Redirect

WWW Redirect

------------------------------------------------------------

# Final Authentication Infrastructure

Completed

✔ Custom SMTP

✔ Resend Integration

✔ Domain Verification

✔ DKIM

✔ SPF

✔ DMARC

✔ Password Reset Emails

✔ Verification Emails

✔ Professional Sender

✔ Production Domain

✔ WWW Redirect

✔ Apex Domain Redirect

✔ Production Ready

------------------------------------------------------------

# Final Email Identity

Display Name

Elite X Trading

Email

noreply@elitextrading.ca

------------------------------------------------------------

# Lessons Learned

1.

SMTP only delivers email.

Authentication remains inside Supabase.

------------------------------------------------------------

2.

Resend replaces ONLY email delivery.

Supabase still manages:

- Users
- Sessions
- Password reset tokens
- Authentication
- Verification tokens

------------------------------------------------------------

3.

DNS propagation takes time.

Always wait before assuming something is broken.

------------------------------------------------------------

4.

For Vercel

Both

WWW

AND

Apex (@)

must be configured correctly.

------------------------------------------------------------

5.

Using WWW as the canonical production domain is the recommended architecture.

------------------------------------------------------------

6.

A missing Apex A Record prevents Vercel from validating the root domain.

------------------------------------------------------------

7.

Always use a single production URL.

Avoid serving both

www

and

non-www

simultaneously.

------------------------------------------------------------

# Current Production Stack

Frontend

Next.js

Hosting

Vercel

Database

Supabase

Authentication

Supabase Auth

SMTP

Resend

SMTP Server

smtp.resend.com

Production URL

https://www.elitextrading.ca

Authentication Email

noreply@elitextrading.ca

Email Security

SPF

DKIM

DMARC

Status

Production Ready

------------------------------------------------------------

# Milestone Completed

This milestone completed the entire production email infrastructure for Elite X Trading OS.

We now have:

✔ Professional branded authentication emails

✔ Enterprise-grade SMTP

✔ Custom domain

✔ Proper DNS authentication

✔ Secure email delivery

✔ Root → WWW redirect

✔ Production-ready authentication infrastructure

This foundation will support:

- Sign Up emails
- Password Reset emails
- Email Verification
- Invite Users
- Billing emails
- Subscription emails
- Alert emails
- Future notification system

without requiring any additional infrastructure changes.