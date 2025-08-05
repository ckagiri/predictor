export default function getDbUri() {
  const {
    CLOUD_MONGO_URI,
    DATA_OPTION,
    MONGO_DB,
    MONGO_HOSTNAME,
    MONGO_PASSWORD,
    MONGO_PORT,
    MONGO_USERNAME,
  } = process.env;
  if (DATA_OPTION === 'local_mongo') {
    if (
      !MONGO_DB ||
      !MONGO_HOSTNAME ||
      !MONGO_PASSWORD ||
      !MONGO_PORT ||
      !MONGO_USERNAME
    ) {
      console.error(
        'Missing one or more required MONGO_DB environment variables.'
      );
      process.exit(1);
    }
    return `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
  } else if (DATA_OPTION === 'cloud_mongo') {
    if (!CLOUD_MONGO_URI) {
      console.error('CLOUD_MONGO_URI ENV variable missing');
      process.exit(1);
    }

    return CLOUD_MONGO_URI;
  } else {
    console.error('DATA_OPTION ENV variable missing');
    process.exit(1);
  }
}
