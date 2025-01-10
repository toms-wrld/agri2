import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2e7d32',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  subHeader: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 10,
    color: '#2e7d32',
    fontWeight: 'bold',
    borderBottom: '2 solid #2e7d32',
    paddingBottom: 5,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottom: '1 solid #e0e0e0',
  },
  label: {
    flex: 3,
    fontSize: 10,
    color: '#555',
    fontWeight: 'medium',
  },
  value: {
    flex: 2,
    fontSize: 10,
    textAlign: 'right',
    color: '#333',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
  },
  co2Section: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  analogyRow: {
    flexDirection: 'row',
    marginVertical: 5,
    fontSize: 11,
  },
  analogyLabel: {
    flex: 1,
    color: '#555',
  },
  analogyValue: {
    flex: 1,
    textAlign: 'right',
    color: '#333',
    fontWeight: 'bold',
  },
});

// Helper function to format Indian prices
const formatIndianPrice = (number) => {
  return new Intl.NumberFormat('en-IN').format(Math.round(number));
};

// PDF Report Component
const MyPdfReport = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>FYM & Fodder Optimization Report</Text>

      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Basic Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Land Holding:</Text>
          <Text style={styles.value}>{data.landholding} ha</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Farmer Category:</Text>
          <Text style={styles.value}>{data.farmerCategory}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Number of Milking Cattle:</Text>
          <Text style={styles.value}>{data.milkingCattle}</Text>
        </View>
      </View>

      {/* FYM Analysis Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>FYM Analysis</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Annual PHR Generation:</Text>
          <Text style={styles.value}>{data.phrGeneration} tonnes</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>FYM Used Annually:</Text>
          <Text style={styles.value}>{data.fymUsed} tonnes</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>FYM Generated In-house:</Text>
          <Text style={styles.value}>{data.fymGenerated} tonnes</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>FYM Purchased:</Text>
          <Text style={styles.value}>{data.fymPurchased} tonnes</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>FYM Purchase Cost:</Text>
          <Text style={styles.value}>₹{formatIndianPrice(data.fymCost)}</Text>
        </View>
      </View>

      {/* Fodder Analysis Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Fodder Analysis</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Annual Dry Fodder Requirement:</Text>
          <Text style={styles.value}>{data.dryFodderRequirement} tonnes</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Purchased Fodder:</Text>
          <Text style={styles.value}>{data.purchasedFodder} tonnes</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fodder Purchase Cost:</Text>
          <Text style={styles.value}>₹{formatIndianPrice(data.fodderPurchaseCost)}</Text>
        </View>
      </View>

      {/* Financial Impact Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Financial Impact</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Avoided Cost (PHR Compost):</Text>
          <Text style={styles.value}>₹{formatIndianPrice(data.avoidedCost)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Added Revenue from Sales:</Text>
          <Text style={styles.value}>₹{formatIndianPrice(data.increasedRevenue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Overall Gain:</Text>
          <Text style={styles.value}>₹{formatIndianPrice(data.overallGain)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Overall Gain (% of Income):</Text>
          <Text style={styles.value}>{data.overallGainPercentage}%</Text>
        </View>
      </View>

      {/* Environmental Impact Section */}
      <View style={styles.section}>
        <Text style={styles.subHeader}>Environmental Impact</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Direct CO₂ Avoided:</Text>
          <Text style={styles.value}>{data.directCO2Avoided} tonnes/year</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CO₂ Avoided (Milk Yield):</Text>
          <Text style={styles.value}>{data.milkYieldCO2Avoided} tonnes/year</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total CO₂ Avoided:</Text>
          <Text style={styles.value}>{data.totalCO2Avoided} tonnes/year</Text>
        </View>
      </View>

      {/* CO₂ Reduction Analogies Section */}
      <View style={styles.co2Section}>
        <Text style={[styles.subHeader, { marginTop: 0 }]}>CO₂ Reduction Analogies</Text>
        <View style={styles.analogyRow}>
          <Text style={styles.analogyLabel}>🌳 Equivalent to annual CO₂ absorption of:</Text>
          <Text style={styles.analogyValue}>{data.co2Analogies.trees} trees</Text>
        </View>
        <View style={styles.analogyRow}>
          <Text style={styles.analogyLabel}>🚗 Equal to removing:</Text>
          <Text style={styles.analogyValue}>{data.co2Analogies.cars} cars/year</Text>
        </View>
        <View style={styles.analogyRow}>
          <Text style={styles.analogyLabel}>🏠 Same as annual emissions of:</Text>
          <Text style={styles.analogyValue}>{data.co2Analogies.households} households</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated by FYM & Fodder Optimizer | Department of Chemical Engineering, VNIT
      </Text>
    </Page>
  </Document>
);

export default MyPdfReport;
