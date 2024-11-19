import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, FlatList, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/dbConnection';

export default function ScholarshipDetails({ navigation, route }) {
    const { id } = route.params;
    const {valid} = route.params;
    const [user, setUser] = useState(null);
    const [organization, setOrg] = useState(null);
    const { offerId } = route.params;
    const [offer, setOffer] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'students', id));
                setUser(userDoc.data());

                const offerDoc = await getDoc(doc(db, 'scholarships', offerId));
                setOffer(offerDoc.data());
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        }

        fetchData();
    }, [id])

    useEffect(() => {

        const fetchData = async () => {
            if (offer && offer.createdBy) {
                try {
                    const org = await getDocs(query(collection(db, 'organization'), where('orgEmail', '==', offer.createdBy)));
                    setOrg(org.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    })));
                } catch (error) {
                    console.error('Error fetching document: ', error);
                }
            }
        }
        fetchData();
    }, [offer])

    return (
        <>
            {
                offer ? (

                    <View key={offer.id} style={styles.container} >

                        <StatusBar barStyle="light-content" backgroundColor="#4D4D4D" />

                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} color="#F7D66A" />
                            </TouchableOpacity>
                            <View style={styles.titleContainer}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>{offer.programName}</Text>
                                    <View style={styles.externalBadge}>
                                        <Text style={styles.externalText}>{offer.programType}</Text>
                                    </View>
                                </View>
                                <View style={styles.headerIcons}>
                                    <TouchableOpacity>
                                        <Ionicons name="help-circle-outline" size={24} color="#F7D66A" />
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Ionicons name="notifications" size={24} color="#F7D66A" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.grantor}>
                            {organization && (
                                organization.map(org => (
                                    <TouchableOpacity
                                        key={org.id}
                                        onPress={() => navigation.navigate('Details', { id: id, institute: org.id })}
                                    >
                                        <Text style={styles.grantorName}>{org.orgName}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>

                        <View style={styles.availableSlotsContainer}>
                            <Text style={styles.availableSlotsText}>Available Slots:</Text>
                            <Text style={styles.availableSlotsValue}>{offer.applied} / {offer.slots}</Text>
                        </View>

                        <View style={styles.contentContainer}>
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Priority Courses:</Text>
                                <FlatList
                                    data={offer.courses}
                                    keyExtractor={(item, index) => index.toString()}
                                    contentContainerStyle={styles.section}
                                    renderItem={({ item }) => (
                                        <Text style={styles.bulletPoint}>• {item}</Text>
                                    )}
                                />
                            </View>

                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Benefits:</Text>
                                <FlatList
                                    data={offer.benefits}
                                    keyExtractor={(item, index) => index.toString()}
                                    contentContainerStyle={styles.section}
                                    renderItem={({ item }) => (
                                        <Text style={styles.bulletPoint}>• {item}</Text>
                                    )}
                                />
                            </View>

                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Requirements:</Text>
                                <FlatList
                                    data={offer.requirements}
                                    keyExtractor={(item, index) => index.toString()}
                                    contentContainerStyle={styles.section}
                                    renderItem={({ item }) => (
                                        <Text style={styles.bulletPoint}>• {item}</Text>
                                    )}
                                />
                            </View>
                        </View>

                        {user.applications < 2 && valid == true && (
                            <TouchableOpacity style={styles.applyButton} onPress={() => navigation.navigate("Application", { id: id, offerId: offerId })}>
                                <Text style={styles.applyButtonText}>Apply Now</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.loading}>
                        <ActivityIndicator
                            size="large"
                            color="#F7D66A"
                        />
                    </View>
                )
            }
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D4D4D',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#4D4D4D',
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#F7D66A',
        fontSize: 16,
        width: 200,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    externalBadge: {
        backgroundColor: '#C4C4C4',
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginLeft: 8,
    },
    externalText: {
        color: '#4D4D4D',
        fontSize: 12,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 60,
    },
    availableSlotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4D4D4D',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F7D66A',
    },
    availableSlotsText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 5,
    },
    availableSlotsValue: {
        color: '#00FF00',
        fontSize: 14,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingBottom: 20,
        marginTop: 10,
    },
    sectionContainer: {
        flex: 1,
        backgroundColor: '#F7D66A',
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4D4D4D',
        marginBottom: 8,
    },
    bulletPoint: {
        fontSize: 12,
        color: '#4D4D4D',
        marginBottom: 4,
    },
    applyButton: {
        backgroundColor: '#333333',
        paddingVertical: 12,
        borderRadius: 20,
        marginHorizontal: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    applyButtonText: {
        color: '#F7D66A',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grantor: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    grantorName: {
        color: '#F7D66A',
    }
});