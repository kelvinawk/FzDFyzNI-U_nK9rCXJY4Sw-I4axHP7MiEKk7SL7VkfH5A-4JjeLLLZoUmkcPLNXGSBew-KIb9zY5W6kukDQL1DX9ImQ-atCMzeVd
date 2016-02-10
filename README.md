# FzDFyzNI-U_nK9rCXJY4Sw-I4axHP7MiEKk7SL7VkfH5A-4JjeLLLZoUmkcPLNXGSBew-KIb9zY5W6kukDQL1DX9ImQ-atCMzeVd

## Goal
----
Code a currency exchagne rate `worker`

1. Input currency `FROM` and `TO`, say USD to HKD, one currency conversation per job.
2. Get `FROM` and `TO` currency every 1 min, save 10 successful rate results to mongodb include the timestamp, then that currency converstaion job is done.
3. If any problem during the get rate attempt, retry it delay with 3s
4. If failed more than 3 times in total (not consecutive), bury the job.

## Architecture

## Installation

## Quick Start Guide

