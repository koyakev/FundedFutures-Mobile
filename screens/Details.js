import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { doc, collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/dbConnection';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Details({ navigation, route }) {
    const { id } = route.params;
    const { institute } = route.params;
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [offers, setOffers] = useState([]);

    useEffect(() => {

        const fetchData = async () => {
            const userDoc = await getDoc(doc(db, 'students', id));
            setUser(userDoc.data());

            const instDoc = await getDoc(doc(db, 'organization', institute));
            setOrganization(instDoc.data());

            const offersQuery = await getDocs(query(collection(db, 'scholarships'), where('createdBy', '==', instDoc.data().orgEmail)));
            const offersList = offersQuery.docs.map(doc => ({
                offerId: doc.id,
                ...doc.data(),
            }));
            setOffers(offersList);
        }

        fetchData();

    }, [id, institute]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButtonContainer} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#FFD700" />
            </TouchableOpacity>

            {organization ? (
                <>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.institutionName}>{organization.orgName}</Text>
                            <Text style={styles.institutionEmail}>{organization.orgEmail}</Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.contentContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>List of Scholarship Programs</Text>
                            <View style={styles.headerIcons}>
                                <TouchableOpacity>
                                    <Ionicons name="help-circle-outline" size={28} color="#F7D66A" />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <MaterialIcons name="notifications" size={28} color="#F7D66A" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.scholarshipContainer}>
                            {offers.length > 0 ? (
                                offers.map((offer) => (
                                    <View key={offer.offerId}>
                                        <View style={styles.scholarshipItem}>
                                            <View style={styles.scholarshipDetails}>
                                                <Text style={styles.institutionName}>{offer.programName}</Text>
                                                <Text style={styles.postDate}>Posted on {offer.dateAdded}</Text>
                                                <View style={styles.slotRow}>
                                                    <Text style={styles.availableSlotsText}>Available Slots:</Text>
                                                    <Text style={styles.availableSlotsValue}>{offer.applied} / {offer.slots}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.externalBadge}>
                                                <Text style={styles.externalText}>{offer.programType}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('ScholarshipDetails', { id: id, offerId: offer.offerId })}
                                                style={styles.arrowButton}
                                            >
                                                <Ionicons name="chevron-forward" size={24} color="#4D4D4D" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text>No available scholarships.</Text>
                            )}

                        </View>
                    </ScrollView>
                </>
            ) : (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="large"
                        color="#F7D66A"
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D4D4D',
    },
    backButtonContainer: {
        position: 'absolute',
        marginTop: 20,
        top: 20,
        left: 15,
        zIndex: 1,
    },
    header: {
        marginTop: 70,
        paddingHorizontal: 15,
        backgroundColor: '#4D4D4D',
    },
    headerContent: {
        alignItems: 'center',
    },
    institutionName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 200
    },
    institutionTypeContainer: {
        backgroundColor: '#F5CBA7',
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginTop: 5,
        marginBottom: 5,
    },
    institutionType: {
        color: '#4D4D4D',
        fontSize: 12,
        textAlign: 'center',
    },
    institutionEmail: {
        color: '#FFFFFF',
        fontSize: 12,
        textAlign: 'center',
    },
    contentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
        elevation: 10
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scholarshipContainer: {
        backgroundColor: '#E6D3A3',
        borderRadius: 15,
        padding: 15,
        elevation: 10
    },
    scholarshipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4D4D4D',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 5
    },
    scholarshipDetails: {
        flex: 1,
    },
    institutionName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    postDate: {
        fontSize: 12,
        color: '#FFFFFF',
        marginBottom: 5,
    },
    slotRow: {
        flexDirection: 'row',
    },
    availableSlotsText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 5,
    },
    availableSlotsValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00FF00',
    },
    externalBadge: {
        backgroundColor: '#FFD700',
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginRight: 10,
    },
    externalText: {
        color: '#4D4D4D',
        fontSize: 12,
        fontWeight: 'bold',
    },
    arrowButton: {
        backgroundColor: '#FFD700',
        borderRadius: 15,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 60,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})
