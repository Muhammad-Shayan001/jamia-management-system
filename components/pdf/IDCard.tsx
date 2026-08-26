import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// In a real app, you'd register a custom Urdu font here
// Font.register({ family: 'NotoNastaliq', src: '/fonts/NotoNastaliqUrdu-Regular.ttf' })

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    flexWrap: 'wrap',
    gap: 20
  },
  card: {
    width: 240,
    height: 380,
    border: '2pt solid #1B4332',
    borderRadius: 8,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#1B4332',
    color: 'white',
    width: '110%',
    marginTop: -10,
    padding: 10,
    textAlign: 'center',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 4
  },
  photo: {
    width: 80,
    height: 100,
    backgroundColor: '#e2e8e4',
    border: '1pt solid #1B4332',
    marginBottom: 10
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 4,
    borderBottom: '1pt dotted #ccc'
  },
  label: {
    fontSize: 9,
    color: '#6B7B72'
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1C2B22'
  },
  qrContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 10
  },
  footer: {
    fontSize: 8,
    color: '#1B4332',
    marginTop: 5
  }
})

export const IDCardPDF = ({ students }: { students: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {students.map((student, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Jamia LMS</Text>
            <Text style={styles.subtitle}>Student ID Card</Text>
          </View>
          
          <View style={styles.photo}>
            {/* In a real app, insert student.photo_url here */}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{student.name_en}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Class:</Text>
            <Text style={styles.value}>{student.class_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID No:</Text>
            <Text style={styles.value}>{student.admission_number}</Text>
          </View>
          
          <View style={styles.qrContainer}>
             {/* We'd generate a QR code data URI and pass it as an image here */}
            <Text style={{ fontSize: 40 }}>[QR]</Text>
            <Text style={styles.footer}>Valid for 2025-2026</Text>
          </View>
        </View>
      ))}
    </Page>
  </Document>
)
