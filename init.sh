#!/bin/bash
CUR_DIR=`pwd`
if [ "$1" = "" ]
then
    DIR='./'
else
    DIR=$1
fi
echo '! init not-project'
cd ${DIR}
mkdir server/logs
mkdir server/data/client
mkdir server/data/server
mkdir server/data/tmp
npm install
bower install
cd ${CUR_DIR}
echo '! done'
exit 0;
