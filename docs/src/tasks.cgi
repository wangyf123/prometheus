#!/usr/bin/perl -w

use lib '/var/www/perl';
use CGI;
use CGI::Session;
use CGI::Carp qw(fatalsToBrowser);
use JSON;
use COMMON;
use strict;

my $q = new CGI();
my $session = CGI::Session->new($q);

print "Content-type: text/html\r\n\r\n";
my $mode = $q->param('mode');
if (COMMON::checkSession($session)) {
    $session->param('timed_out', 1);
    print 'noauth';
    exit;
}

if (not ($mode =~ /^[0-9]+$/)) {
    print 'Bad request!';
    exit;
}

if ($mode == 0) {
    my @taskCols = ('*');
    my @searchCols = ('user_id')
    my @searchOps = ('=');
    my @searchVals = ($session->param('user_id'));
    my @logic = ();
    my $tasksRef = COMMON::searchTable('tasks', \@taskCols, \@searchCols, \@searchOps, \@searchVals, \@logic);
}
exit;
