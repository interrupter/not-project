#!/bin/bash
CUR_DIR=`pwd`
if [ "$1" = "" ]
then
	DIR='./'
else
	DIR=$1
fi
echo '! init not-project'
echo 'current directory' $CUR_DIR
echo 'target directory' $DIR
cd ${DIR}
mkdir logs
mkdir data
mkdir data/client
mkdir data/server
mkdir data/tmp
npm install
bower install
cd ${CUR_DIR}
echo '! done'
exit 0;
