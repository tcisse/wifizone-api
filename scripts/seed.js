require('dotenv').config();
const mongoose = require('mongoose');
const { User, Zone, Plan, Ticket, Transaction, Withdrawal, KYC, Notification } = require('../src/models');
const logger = require('../src/config/logger');
const { ROLES, KYC_STATUS, ZONE_STATUS, PLAN_STATUS, TICKET_STATUS, TRANSACTION_TYPES, TRANSACTION_STATUS, WITHDRAWAL_STATUS, MOBILE_MONEY_PROVIDERS, NOTIFICATION_TYPES } = require('../src/config/constants');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB Connected for seeding');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Clear all data
const clearDatabase = async () => {
  logger.info('Clearing database...');

  await User.deleteMany({});
  await Zone.deleteMany({});
  await Plan.deleteMany({});
  await Ticket.deleteMany({});
  await Transaction.deleteMany({});
  await Withdrawal.deleteMany({});
  await KYC.deleteMany({});
  await Notification.deleteMany({});

  logger.info('Database cleared!');
};

// Create users
const createUsers = async () => {
  logger.info('Creating users...');

  // Admin user
  const admin = await User.create({
    email: 'admin@wifizone.com',
    phone: '+225010101010',
    password: 'Admin@123',
    firstname: 'Admin',
    lastname: 'WiFi Zone',
    country: 'CI',
    role: ROLES.ADMIN,
    emailVerified: true,
    kycStatus: KYC_STATUS.VERIFIED,
    balance: {
      total: 0,
      available: 0,
      pending: 0,
      reserved: 0,
    },
  });
  admin.referralCode = admin.generateReferralCode();
  await admin.save();

  // Regular users with verified KYC
  const users = [];

  const user1 = await User.create({
    email: 'kouadio.jean@example.com',
    phone: '+225070000001',
    password: 'User@123',
    firstname: 'Jean',
    lastname: 'Kouadio',
    country: 'CI',
    role: ROLES.USER,
    emailVerified: true,
    kycStatus: KYC_STATUS.VERIFIED,
    balance: {
      total: 1245000,
      available: 1195000,
      pending: 0,
      reserved: 50000,
    },
  });
  user1.referralCode = user1.generateReferralCode();
  await user1.save();
  users.push(user1);

  const user2 = await User.create({
    email: 'yao.marie@example.com',
    phone: '+225070000002',
    password: 'User@123',
    firstname: 'Marie',
    lastname: 'Yao',
    country: 'CI',
    role: ROLES.USER,
    emailVerified: true,
    kycStatus: KYC_STATUS.VERIFIED,
    referredBy: user1._id,
    balance: {
      total: 850000,
      available: 800000,
      pending: 0,
      reserved: 50000,
    },
  });
  user2.referralCode = user2.generateReferralCode();
  await user2.save();
  users.push(user2);

  const user3 = await User.create({
    email: 'kone.ibrahim@example.com',
    phone: '+225070000003',
    password: 'User@123',
    firstname: 'Ibrahim',
    lastname: 'Koné',
    country: 'CI',
    role: ROLES.USER,
    emailVerified: true,
    kycStatus: KYC_STATUS.PENDING,
    referredBy: user1._id,
    balance: {
      total: 320000,
      available: 320000,
      pending: 0,
      reserved: 0,
    },
  });
  user3.referralCode = user3.generateReferralCode();
  await user3.save();
  users.push(user3);

  const user4 = await User.create({
    email: 'traore.fatou@example.com',
    phone: '+225070000004',
    password: 'User@123',
    firstname: 'Fatou',
    lastname: 'Traoré',
    country: 'CI',
    role: ROLES.USER,
    emailVerified: false,
    kycStatus: KYC_STATUS.NOT_VERIFIED,
    balance: {
      total: 0,
      available: 0,
      pending: 0,
      reserved: 0,
    },
  });
  user4.referralCode = user4.generateReferralCode();
  await user4.save();
  users.push(user4);

  logger.info(`Created ${users.length + 1} users (1 admin + ${users.length} regular users)`);
  return { admin, users };
};

// Create KYC records
const createKYC = async (users) => {
  logger.info('Creating KYC records...');

  // Verified KYC for user1
  await KYC.create({
    user: users[0]._id,
    status: KYC_STATUS.VERIFIED,
    documents: [
      {
        type: 'id_front',
        url: 'https://example.com/kyc/id_front_1.jpg',
        status: KYC_STATUS.VERIFIED,
        uploadedAt: new Date('2024-01-10'),
      },
      {
        type: 'id_back',
        url: 'https://example.com/kyc/id_back_1.jpg',
        status: KYC_STATUS.VERIFIED,
        uploadedAt: new Date('2024-01-10'),
      },
      {
        type: 'selfie',
        url: 'https://example.com/kyc/selfie_1.jpg',
        status: KYC_STATUS.VERIFIED,
        uploadedAt: new Date('2024-01-10'),
      },
    ],
    submittedAt: new Date('2024-01-10'),
    verifiedAt: new Date('2024-01-11'),
  });

  // Verified KYC for user2
  await KYC.create({
    user: users[1]._id,
    status: KYC_STATUS.VERIFIED,
    documents: [
      {
        type: 'id_front',
        url: 'https://example.com/kyc/id_front_2.jpg',
        status: KYC_STATUS.VERIFIED,
        uploadedAt: new Date('2024-01-12'),
      },
      {
        type: 'id_back',
        url: 'https://example.com/kyc/id_back_2.jpg',
        status: KYC_STATUS.VERIFIED,
        uploadedAt: new Date('2024-01-12'),
      },
      {
        type: 'selfie',
        url: 'https://example.com/kyc/selfie_2.jpg',
        status: KYC_STATUS.VERIFIED,
        uploadedAt: new Date('2024-01-12'),
      },
    ],
    submittedAt: new Date('2024-01-12'),
    verifiedAt: new Date('2024-01-13'),
  });

  // Pending KYC for user3
  await KYC.create({
    user: users[2]._id,
    status: KYC_STATUS.PENDING,
    documents: [
      {
        type: 'id_front',
        url: 'https://example.com/kyc/id_front_3.jpg',
        status: KYC_STATUS.PENDING,
        uploadedAt: new Date(),
      },
      {
        type: 'id_back',
        url: 'https://example.com/kyc/id_back_3.jpg',
        status: KYC_STATUS.PENDING,
        uploadedAt: new Date(),
      },
      {
        type: 'selfie',
        url: 'https://example.com/kyc/selfie_3.jpg',
        status: KYC_STATUS.PENDING,
        uploadedAt: new Date(),
      },
    ],
    submittedAt: new Date(),
  });

  logger.info('Created 3 KYC records');
};

// Create zones
const createZones = async (users) => {
  logger.info('Creating WiFi zones...');

  const zones = [];

  // Zones for user1 (Jean Kouadio)
  const zone1 = await Zone.create({
    owner: users[0]._id,
    name: 'Zone Plateau',
    description: 'Zone WiFi au cœur du Plateau',
    address: 'Boulevard de la République',
    city: 'Abidjan',
    country: 'CI',
    location: {
      type: 'Point',
      coordinates: [-4.033333, 5.316667], // [longitude, latitude]
    },
    routerConfig: {
      ip: '192.168.1.1',
      username: 'admin',
      password: 'encrypted_password_1',
      apiPort: 8728,
    },
    status: ZONE_STATUS.ACTIVE,
    stats: {
      totalTickets: 500,
      availableTickets: 45,
      soldTickets: 455,
      usedTickets: 380,
      totalRevenue: 2275000,
    },
  });
  zones.push(zone1);

  const zone2 = await Zone.create({
    owner: users[0]._id,
    name: 'Zone Cocody',
    description: 'Zone WiFi à Cocody Angré',
    address: 'Boulevard Latrille',
    city: 'Abidjan',
    country: 'CI',
    location: {
      type: 'Point',
      coordinates: [-3.983333, 5.35],
    },
    routerConfig: {
      ip: '192.168.2.1',
      username: 'admin',
      password: 'encrypted_password_2',
      apiPort: 8728,
    },
    status: ZONE_STATUS.ACTIVE,
    stats: {
      totalTickets: 300,
      availableTickets: 28,
      soldTickets: 272,
      usedTickets: 220,
      totalRevenue: 1360000,
    },
  });
  zones.push(zone2);

  // Zones for user2 (Marie Yao)
  const zone3 = await Zone.create({
    owner: users[1]._id,
    name: 'Zone Yopougon',
    description: 'Zone WiFi à Yopougon Siporex',
    address: 'Rue Princesse',
    city: 'Abidjan',
    country: 'CI',
    location: {
      type: 'Point',
      coordinates: [-4.083333, 5.333333],
    },
    routerConfig: {
      ip: '192.168.3.1',
      username: 'admin',
      password: 'encrypted_password_3',
      apiPort: 8728,
    },
    status: ZONE_STATUS.ACTIVE,
    stats: {
      totalTickets: 400,
      availableTickets: 62,
      soldTickets: 338,
      usedTickets: 280,
      totalRevenue: 1690000,
    },
  });
  zones.push(zone3);

  const zone4 = await Zone.create({
    owner: users[1]._id,
    name: 'Zone Marcory',
    description: 'Zone WiFi à Marcory Zone 4',
    address: 'Boulevard VGE',
    city: 'Abidjan',
    country: 'CI',
    location: {
      type: 'Point',
      coordinates: [-4.016667, 5.283333],
    },
    routerConfig: {
      ip: '192.168.4.1',
      username: 'admin',
      password: 'encrypted_password_4',
      apiPort: 8728,
    },
    status: ZONE_STATUS.ACTIVE,
    stats: {
      totalTickets: 250,
      availableTickets: 18,
      soldTickets: 232,
      usedTickets: 195,
      totalRevenue: 1160000,
    },
  });
  zones.push(zone4);

  // Inactive zone for user3
  const zone5 = await Zone.create({
    owner: users[2]._id,
    name: 'Zone Abobo (Inactive)',
    description: 'Zone WiFi à Abobo - En maintenance',
    address: 'Rue du Commerce',
    city: 'Abidjan',
    country: 'CI',
    location: {
      type: 'Point',
      coordinates: [-4.016667, 5.433333],
    },
    routerConfig: {
      ip: '192.168.5.1',
      username: 'admin',
      password: 'encrypted_password_5',
      apiPort: 8728,
    },
    status: ZONE_STATUS.INACTIVE,
    stats: {
      totalTickets: 100,
      availableTickets: 100,
      soldTickets: 0,
      usedTickets: 0,
      totalRevenue: 0,
    },
  });
  zones.push(zone5);

  logger.info(`Created ${zones.length} WiFi zones`);
  return zones;
};

// Create plans
const createPlans = async (zones) => {
  logger.info('Creating pricing plans...');

  const plans = [];

  // Plans for each active zone
  for (const zone of zones.filter(z => z.status === ZONE_STATUS.ACTIVE)) {
    // 2 hours plan
    const plan1 = await Plan.create({
      zone: zone._id,
      name: '2 heures',
      description: 'Forfait 2 heures',
      duration: 7200, // 2 hours in seconds
      price: 1000,
      downloadLimit: null,
      uploadLimit: null,
      status: PLAN_STATUS.ACTIVE,
      stats: {
        totalTickets: Math.floor(zone.stats.totalTickets * 0.4),
        soldTickets: Math.floor(zone.stats.soldTickets * 0.4),
        totalRevenue: Math.floor(zone.stats.soldTickets * 0.4) * 1000,
      },
    });
    plans.push(plan1);

    // 6 hours plan
    const plan2 = await Plan.create({
      zone: zone._id,
      name: '6 heures',
      description: 'Forfait demi-journée',
      duration: 21600, // 6 hours
      price: 2500,
      downloadLimit: null,
      uploadLimit: null,
      status: PLAN_STATUS.ACTIVE,
      stats: {
        totalTickets: Math.floor(zone.stats.totalTickets * 0.35),
        soldTickets: Math.floor(zone.stats.soldTickets * 0.35),
        totalRevenue: Math.floor(zone.stats.soldTickets * 0.35) * 2500,
      },
    });
    plans.push(plan2);

    // 24 hours plan
    const plan3 = await Plan.create({
      zone: zone._id,
      name: '24 heures',
      description: 'Forfait journée complète',
      duration: 86400, // 24 hours
      price: 5000,
      downloadLimit: null,
      uploadLimit: null,
      status: PLAN_STATUS.ACTIVE,
      stats: {
        totalTickets: Math.floor(zone.stats.totalTickets * 0.25),
        soldTickets: Math.floor(zone.stats.soldTickets * 0.25),
        totalRevenue: Math.floor(zone.stats.soldTickets * 0.25) * 5000,
      },
    });
    plans.push(plan3);
  }

  logger.info(`Created ${plans.length} pricing plans`);
  return plans;
};

// Create tickets
const createTickets = async (zones, plans) => {
  logger.info('Creating tickets...');

  const tickets = [];

  for (const zone of zones.filter(z => z.status === ZONE_STATUS.ACTIVE)) {
    const zonePlans = plans.filter(p => p.zone.toString() === zone._id.toString());

    for (const plan of zonePlans) {
      const ticketCount = Math.floor(plan.stats.totalTickets / 3); // Create some tickets for each plan

      for (let i = 0; i < ticketCount; i++) {
        const isAvailable = i < Math.floor(ticketCount * 0.15); // 15% available
        const isSold = i >= Math.floor(ticketCount * 0.15) && i < Math.floor(ticketCount * 0.85); // 70% sold
        const isUsed = i >= Math.floor(ticketCount * 0.85); // 15% used

        const username = await Ticket.generateUsername(zone.name);
        const password = Ticket.generatePassword();

        const ticketData = {
          ticketId: `TKT${Date.now()}${i}`,
          zone: zone._id,
          plan: plan._id,
          owner: zone.owner,
          username,
          password,
          status: isAvailable ? TICKET_STATUS.AVAILABLE : (isUsed ? TICKET_STATUS.USED : TICKET_STATUS.SOLD),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        if (isSold || isUsed) {
          ticketData.soldAt = new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000);
          ticketData.buyer = {
            name: `Client ${i + 1}`,
            phone: `+225070${String(i).padStart(6, '0')}`,
          };
        }

        if (isUsed) {
          ticketData.usedAt = new Date(ticketData.soldAt.getTime() + Math.random() * 2 * 60 * 60 * 1000);
          ticketData.sessionData = {
            mac: `AA:BB:CC:DD:EE:${String(i).padStart(2, '0')}`,
            ip: `192.168.${zone.routerConfig.ip.split('.')[2]}.${100 + i}`,
            loginAt: ticketData.usedAt,
            logoutAt: new Date(ticketData.usedAt.getTime() + plan.duration * 1000),
            sessionDuration: plan.duration,
            bytesDownloaded: Math.floor(Math.random() * 1000000000),
            bytesUploaded: Math.floor(Math.random() * 100000000),
          };
        }

        const ticket = await Ticket.create(ticketData);
        tickets.push(ticket);
      }
    }
  }

  logger.info(`Created ${tickets.length} tickets`);
  return tickets;
};

// Create transactions
const createTransactions = async (users, zones, tickets) => {
  logger.info('Creating transactions...');

  const transactions = [];

  // Sale transactions for sold and used tickets
  const soldTickets = tickets.filter(t => t.status === TICKET_STATUS.SOLD || t.status === TICKET_STATUS.USED);

  for (const ticket of soldTickets.slice(0, 50)) { // Limit to 50 for seed
    const plan = await Plan.findById(ticket.plan);
    const commission = Math.round(plan.price * 0.05); // 5% commission
    const net = plan.price - commission;

    const transaction = await Transaction.create({
      transactionId: Transaction.generateTransactionId(TRANSACTION_TYPES.SALE),
      user: ticket.owner,
      type: TRANSACTION_TYPES.SALE,
      description: `Vente ticket ${plan.name}`,
      amount: plan.price,
      commission,
      net,
      status: TRANSACTION_STATUS.COMPLETED,
      metadata: {
        ticketId: ticket._id,
        zoneId: ticket.zone,
        planId: ticket.plan,
      },
      balanceBefore: 0,
      balanceAfter: net,
      completedAt: ticket.soldAt,
      createdAt: ticket.soldAt,
    });

    transactions.push(transaction);
  }

  logger.info(`Created ${transactions.length} transactions`);
  return transactions;
};

// Create withdrawals
const createWithdrawals = async (users) => {
  logger.info('Creating withdrawals...');

  const withdrawals = [];

  // Completed withdrawal for user1
  const withdrawal1 = await Withdrawal.create({
    withdrawalId: Withdrawal.generateWithdrawalId(),
    user: users[0]._id,
    amount: 50000,
    fees: 1000 + Math.round(50000 * 0.02),
    netAmount: 50000 + 1000 + Math.round(50000 * 0.02),
    provider: MOBILE_MONEY_PROVIDERS.MTN,
    phoneNumber: users[0].phone,
    status: WITHDRAWAL_STATUS.COMPLETED,
    externalTransactionId: 'MTN_' + Date.now(),
    processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });
  withdrawals.push(withdrawal1);

  // Pending withdrawal for user2
  const withdrawal2 = await Withdrawal.create({
    withdrawalId: Withdrawal.generateWithdrawalId(),
    user: users[1]._id,
    amount: 100000,
    fees: 1000 + Math.round(100000 * 0.02),
    netAmount: 100000 + 1000 + Math.round(100000 * 0.02),
    provider: MOBILE_MONEY_PROVIDERS.ORANGE,
    phoneNumber: users[1].phone,
    status: WITHDRAWAL_STATUS.PENDING,
    createdAt: new Date(),
  });
  withdrawals.push(withdrawal2);

  logger.info(`Created ${withdrawals.length} withdrawals`);
  return withdrawals;
};

// Create notifications
const createNotifications = async (users) => {
  logger.info('Creating notifications...');

  const notifications = [];

  // Notifications for user1
  const notif1 = await Notification.create({
    user: users[0]._id,
    type: NOTIFICATION_TYPES.SALE,
    title: 'Nouvelle vente',
    message: 'Un ticket a été vendu sur Zone Plateau',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });
  notifications.push(notif1);

  const notif2 = await Notification.create({
    user: users[0]._id,
    type: NOTIFICATION_TYPES.STOCK_ALERT,
    title: 'Stock faible',
    message: 'Zone Plateau - Il reste seulement 45 tickets disponibles',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  });
  notifications.push(notif2);

  const notif3 = await Notification.create({
    user: users[0]._id,
    type: NOTIFICATION_TYPES.WITHDRAWAL,
    title: 'Retrait traité',
    message: 'Votre retrait de 50,000 FCFA a été traité avec succès',
    read: true,
    readAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });
  notifications.push(notif3);

  // Notifications for user2
  const notif4 = await Notification.create({
    user: users[1]._id,
    type: NOTIFICATION_TYPES.SALE,
    title: 'Nouvelle vente',
    message: 'Un ticket a été vendu sur Zone Yopougon',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  });
  notifications.push(notif4);

  const notif5 = await Notification.create({
    user: users[2]._id,
    type: NOTIFICATION_TYPES.KYC_UPDATE,
    title: 'KYC en cours de vérification',
    message: 'Vos documents KYC sont en cours de vérification',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  });
  notifications.push(notif5);

  logger.info(`Created ${notifications.length} notifications`);
  return notifications;
};

// Main seed function
const seed = async () => {
  try {
    await connectDB();

    // Ask for confirmation
    const args = process.argv.slice(2);
    const force = args.includes('--force');

    if (!force) {
      logger.warn('⚠️  WARNING: This will delete all existing data!');
      logger.warn('Run with --force flag to confirm: npm run seed -- --force');
      process.exit(0);
    }

    // Clear database
    await clearDatabase();

    // Create data
    const { admin, users } = await createUsers();
    await createKYC(users);
    const zones = await createZones(users);
    const plans = await createPlans(zones);
    const tickets = await createTickets(zones, plans);
    await createTransactions(users, zones, tickets);
    await createWithdrawals(users);
    await createNotifications(users);

    logger.info('');
    logger.info('✅ Database seeded successfully!');
    logger.info('');
    logger.info('=== TEST CREDENTIALS ===');
    logger.info('');
    logger.info('Admin:');
    logger.info('  Email: admin@wifizone.com');
    logger.info('  Password: Admin@123');
    logger.info('');
    logger.info('Users:');
    logger.info('  1. Email: kouadio.jean@example.com | Password: User@123 (KYC Verified)');
    logger.info('  2. Email: yao.marie@example.com | Password: User@123 (KYC Verified)');
    logger.info('  3. Email: kone.ibrahim@example.com | Password: User@123 (KYC Pending)');
    logger.info('  4. Email: traore.fatou@example.com | Password: User@123 (No KYC)');
    logger.info('');
    logger.info(`📊 Summary:`);
    logger.info(`  - ${users.length + 1} users (1 admin + ${users.length} regular)`);
    logger.info(`  - ${zones.length} WiFi zones`);
    logger.info(`  - ${plans.length} pricing plans`);
    logger.info(`  - ${tickets.length} tickets`);
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seed();
