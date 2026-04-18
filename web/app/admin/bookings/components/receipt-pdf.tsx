import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Booking } from "./booking-detail-panel";

const COLORS = {
  PRIMARY: "#E5195E",
  BLACK: "#111111",
  DARK: "#374151",
  GRAY: "#6B7280",
  LIGHT_GRAY: "#E5E7EB",
  BG: "#F9FAFB",
  WHITE: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.WHITE,
    padding: 40,
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },

  brandName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.PRIMARY,
    letterSpacing: 1,
  },

  brandTagline: {
    fontSize: 9,
    color: COLORS.GRAY,
    marginTop: 2,
  },

  receiptLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.GRAY,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "right",
  },

  receiptId: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.BLACK,
    textAlign: "right",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.GRAY,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },

  rowLabel: {
    fontSize: 10,
    color: COLORS.GRAY,
  },

  rowValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.BLACK,
  },

  totalCard: {
    backgroundColor: COLORS.BG,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.DARK,
  },

  totalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.PRIMARY,
  },

  dividerDashed: {
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    borderStyle: "dashed",
    marginVertical: 20,
  },

  statusBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  statusText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#065F46",
  },

  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
  },

  footerText: {
    fontSize: 9,
    color: COLORS.GRAY,
    textAlign: "center",
    lineHeight: 1.6,
  },
});

type Props = { booking: Booking; receiptId: string };

export function ReceiptPDF({ booking, receiptId }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>RUNWAE</Text>
            <Text style={styles.brandTagline}>Booking Receipt</Text>
          </View>
          <View>
            <Text style={styles.receiptLabel}>Receipt</Text>
            <Text style={styles.receiptId}>{receiptId}</Text>
          </View>
        </View>

        {/* Booking details */}
        <Text style={styles.sectionTitle}>Booking Details</Text>

        {[
          { label: "Booking Reference", value: booking.bookingRef },
          { label: "Booking Date", value: booking.bookingDate },
          { label: "Booking Type", value: booking.bookingType },
          { label: "Event Name", value: booking.eventName },
          { label: "Attendee Name", value: booking.attendeeName },
          { label: "Host", value: booking.hostName },
          { label: "Vendor", value: booking.vendorName },
        ].map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{item.value}</Text>
          </View>
        ))}

        {/* Status */}
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.rowLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.dividerDashed} />

        {/* Financial breakdown */}
        <Text style={styles.sectionTitle}>Financial Breakdown</Text>

        {[
          { label: "Platform Commission", value: booking.platformCommission },
          { label: "Host Breakdown", value: booking.hostBreakdown },
          { label: "Vendor Payout", value: booking.vendorPayout },
        ].map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{item.value}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Revenue</Text>
          <Text style={styles.totalValue}>{booking.totalRevenue}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This receipt was generated by Runwae.{"\n"}
            For support, contact support@runwae.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}
