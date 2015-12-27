#!/usr/bin/env python

import arrow
dates = [x[0].format('YYYY-MM-DD') for x in arrow.Arrow.span_range('week', arrow.get('2015-01-07'), arrow.get('2015-12-31'))]
print "\n".join(dates)
